import base64,os,sys,subprocess,time,shutil,re
from playwright.sync_api import sync_playwright,expect
DIR='/tmp/e2e-blobs';shutil.rmtree(DIR,ignore_errors=True)
srv=subprocess.Popen(['node','/home/claude/site/tools/test/server.js','8765'],env=dict(os.environ,BLOBS_DIR=DIR));time.sleep(1)
B='http://localhost:8765';res=[]
open('/tmp/shot.png','wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))
open('/tmp/logo.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#22d3ee"/></svg>')
def T(n,ok,info=''):
    res.append(ok);print(('PASS ' if ok else 'FAIL ')+n+(('  -> '+str(info)) if info else ''))
with sync_playwright() as p:
    br=p.chromium.launch();ctx=br.new_context(viewport={'width':1440,'height':900});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.goto(B+'/admin/');pg.wait_for_selector('#l-u');T('admin shows sign-in screen when not signed in',True)
    pg.fill('#l-u','admin');pg.fill('#l-p','WrongPass!1');pg.click('.lbox button');pg.wait_for_selector('.errt:not(:empty)');T('wrong password -> error shown',pg.inner_text('.errt')=='Incorrect username or password.',pg.inner_text('.errt'))
    pg.fill('#l-p','ChangeMe123!');pg.click('.lbox button');pg.wait_for_selector('#view h1');T('right password -> dashboard',pg.inner_text('#view h1')=='Dashboard')
    T('default-password warning shown',pg.locator('.warn').count()==1)
    pg.wait_for_timeout(500);T('dashboard counts',pg.inner_text('.tiles')!='' and 'Services' in pg.inner_text('.tiles'),pg.inner_text('.tiles').replace('\n',' '))
    nav=lambda r:(pg.click(f'.sb .nv[data-r={r}]'),pg.wait_for_timeout(250))
    save=lambda:(pg.click('#savebtn'),pg.wait_for_selector('#toast.show'),pg.wait_for_timeout(300))
    pub=lambda path,wait=1800:(lambda c:(c.new_page()))(br.new_context(viewport={'width':1440,'height':900}))
    def look(path,fn,wait=1800):
        c=br.new_context(viewport={'width':1440,'height':900});q=c.new_page();q.on('pageerror',lambda e:print('   PAGEERR',path,str(e)[:200]));q.on('console',lambda m:print('   CONSOLE',path,m.text[:160]) if m.type=='error' and 'ERR_' not in m.text and 'Failed to load' not in m.text else None);q.bring_to_front();q.goto(B+path);q.wait_for_function("window.__H!=='82f705cf7e5f0d0a'",timeout=15000);q.wait_for_timeout(400);r=fn(q);c.close();return r
    # ---- Home page edit
    nav('home');pg.get_by_label('Availability pill').fill('Open for new clients');pg.get_by_label('Tagline').fill('Edited tagline from admin');
    T('unsaved indicator appears',pg.inner_text('#state')=='You have unsaved changes');save()
    T('save toast + indicator',pg.inner_text('#state')=='All changes saved')
    pg.reload();pg.wait_for_selector('#view h1');nav('home');T('edit survives a refresh',pg.get_by_label('Tagline').input_value()=='Edited tagline from admin')
    T('edit visible to a different browser (fresh session)',look('/index.html',lambda q:'Open for new clients' in q.inner_text('.pill') and 'Edited tagline from admin' in q.inner_text('.tag')))
    # hero rotating roles + stats list add/delete
    pg.locator('.lst:has(h3:text-is("Rotating roles / specialities")) .row').first.locator('input').fill('Growth Marketing');save()
    T('rotating role saved',look('/index.html',lambda q:'Growth Marketing' in q.inner_text('[data-rot]')+q.inner_html('[data-rot]')))
    # ---- My Work: add with image picker
    nav('work');pg.click('text=+ Add project');ri=pg.locator('.ri').last
    ri.get_by_label('Title').fill('Brand New Project');ri.get_by_label('Short description').fill('A description added from the admin panel.')
    ri.get_by_role('button',name='Choose').click();pg.wait_for_selector('.md');pg.locator('.md input[type=file]').set_input_files('/tmp/shot.png');pg.wait_for_selector('.md',state='detached')
    T('image picker upload fills the field',re.match(r'/api/img/[0-9a-f]{16}\.png',ri.get_by_label('Screenshot').input_value()) is not None,ri.get_by_label('Screenshot').input_value());save()
    T('new project on My Work page',look('/work.html',lambda q:'Brand New Project' in q.inner_text('.gal')))
    T('new project is first featured card on Home',look('/index.html',lambda q:q.locator('.wk h3').first.inner_text()=='Brand New Project'))
    T('uploaded image loads on the public page',look('/work.html',lambda q:q.evaluate("document.querySelector('.gc').scrollIntoView()") or (q.wait_for_function("[...document.querySelectorAll('.gc img')].some(i=>i.src.includes('/api/img/')&&i.naturalWidth>0)",timeout=8000) is not None)))
    nav('work');pg.locator('.ri').filter(has_text='Brand New Project').get_by_label('Delete').click();save()
    T('delete project',look('/work.html',lambda q:'Brand New Project' not in q.inner_text('.gal')))
    # ---- empty a list: delete all testimonials, stays empty
    nav('testimonials')
    while pg.locator('.lst:has(h3:text-is("Reviews")) .ri').count():pg.locator('.lst:has(h3:text-is("Reviews")) .ri').first.get_by_label('Delete').click()
    save();pg.reload();pg.wait_for_selector('#view h1');nav('testimonials');T('deleted-all list stays empty after refresh (not refilled)',pg.locator('.lst:has(h3:text-is("Reviews")) .ri').count()==0)
    T('Testimonials page has no review panels; Home slider hidden',look('/testimonials.html',lambda q:q.locator('.feat').count()==0 and q.locator('.tc').count()==0) and look('/index.html',lambda q:q.locator('[data-sl]').count()==0))
    pg.click('text=+ Add review');ri=pg.locator('.ri').last;ri.get_by_label('Name',exact=True).fill('Laura Bennett');ri.get_by_label('Role').fill('Studio Owner');ri.get_by_label('Service tag').fill('Google Ads Management');ri.get_by_label('Review text').fill('Wonderful to work with and very clear in every update.');ri.get_by_label('Avatar initials (blank = automatic)').fill('LB');ri.locator('input[type=color]').first.fill('#ff0000');save()
    T('added review appears with custom initials + colour',look('/testimonials.html',lambda q:'Laura Bennett' in q.inner_text('#feat') and q.inner_text('#feat .av')=='LB' and 'ff0000' in (q.get_attribute('#feat .av','style') or '')))
    # ---- Services add -> dropdown, home card, footer, services page
    nav('services');pg.click('text=+ Add service');ri=pg.locator('.ri').last;ri.get_by_label('Service name').fill('Email Marketing');ri.get_by_label('Category tag').fill('Email');ri.get_by_label('Short description (Home page card)').fill('Short text.');ri.get_by_label('Description (Services page)').fill('Longer text about email marketing.')
    ri.locator('.lst button:has-text("+ Add item")').click();ri.locator('.lst .row input').first.fill('Newsletter design');save()
    T('new service on Services page, Home grid, footer, Contact dropdown',look('/services.html',lambda q:'Email Marketing' in q.inner_text('.grid3') and 'Newsletter design' in q.inner_text('.grid3')) and look('/index.html',lambda q:'Email Marketing' in q.inner_text('footer')) and look('/contact.html',lambda q:'Email Marketing' in q.locator('#f-s').inner_text()))
    # ---- About + Contact information
    nav('about');pg.get_by_label('Opening line').fill('A brand new opening line.');save();T('About Me edit',look('/about.html',lambda q:'A brand new opening line.' in q.inner_text('.lead')))
    nav('contact');pg.get_by_label('Phone number',exact=True).fill('01711111111');pg.get_by_label('Second phone number').fill('');pg.get_by_label('Email address').fill('hello@newdomain.com');save()
    T('contact info flows to Contact page, footer and tel/mailto links',look('/contact.html',lambda q:'01711111111' in q.inner_text('.cs') and '01788358751' not in q.inner_text('.cs') and q.locator('a[href="tel:+8801711111111"]').count()>=2 and q.locator('a[href="mailto:hello@newdomain.com"]').count()>=2 and 'hello@newdomain.com' in q.inner_text('footer')))
    nav('contact');pg.locator('.lst:has(h3:text-is("Social links")) .ri').first.get_by_label('Delete').click();save()
    T('removed social link disappears',look('/contact.html',lambda q:q.locator('.fo .soc a').count()==3))
    # ---- Theme
    nav('theme');pg.click('.pre button:has-text("Sunset")');save()
    T('theme preset saved and applied on pages (a different browser)',look('/services.html',lambda q:q.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--c1').trim()")=='#ff7a45') and look('/contact.html',lambda q:q.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--c1').trim()")=='#ff7a45'))
    # ---- Settings: brand, logo, favicon, title
    nav('settings');pg.get_by_label('Brand name').fill('Rasif Studio');pg.get_by_label('Browser title (Home page)').fill('Rasif Studio | Growth Marketing')
    pg.locator('.fld:has(label:text-is("Logo image")) button:has-text("Choose")').click();pg.locator('.md input[type=file]').set_input_files('/tmp/logo.svg');pg.wait_for_selector('.md',state='detached')
    pg.locator('.fld:has(label:text-is("Browser tab icon")) button:has-text("Choose")').click();pg.locator('.md input[type=file]').set_input_files('/tmp/shot.png');pg.wait_for_selector('.md',state='detached');save()
    T('logo image, tab icon, brand name and browser title applied',look('/index.html',lambda q:q.locator('.hd .brand img').count()==1 and '/api/img/' in q.get_attribute('.hd .brand img','src') and q.title()=='Rasif Studio | Growth Marketing' and '/api/img/' in q.get_attribute('link[rel=icon]','href')))
    # ---- sticky navbar still works after a re-render
    def sticky(q):
        q.wait_for_function("window.__H!=='82f705cf7e5f0d0a'");q.evaluate("scrollTo({top:400,behavior:'instant'})");q.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(r,200))))")
        r=q.evaluate("[document.querySelector('.hd').className,scrollY,document.documentElement.scrollHeight]");print('   sticky state',r);return 'sc' in r[0].split()
    T('sticky header works after content was re-rendered by the boot script',look('/index.html',sticky))
    # ---- Inbox: real submit from the public contact page
    c2=br.new_context();q=c2.new_page();q.goto(B+'/contact.html');q.wait_for_timeout(1500);q.fill('#f-n','Anna Visitor');q.fill('#f-e','anna@example.com');q.select_option('#f-s',index=1);q.fill('#f-m','Hello from the real contact form, I need help.');q.click('.send');q.wait_for_selector('#ok:not([hidden])');T('public contact form -> server confirms -> Message Sent',True);c2.close()
    nav('inbox');pg.wait_for_selector('.msg');T('message appears in Inbox',pg.locator('.msg').count()==1 and 'Anna Visitor' in pg.inner_text('.msg'))
    pg.locator('.msg .dng').click();pg.wait_for_timeout(500);T('delete message from Inbox',pg.locator('.msg').count()==0)
    # ---- Media page
    nav('media');pg.locator('#view input[type=file]').set_input_files('/tmp/shot.png');pg.wait_for_selector('#toast.show');pg.wait_for_timeout(700);n=pg.locator('.mi').count();T('Media page: upload + list',n>=1,n)
    pg.locator('.mi .dng').first.click();pg.wait_for_timeout(600);T('Media page: delete',pg.locator('.mi').count()==n-1)
    # ---- Reset keeps theme + login
    nav('settings');pg.click('text=Reset to original content');pg.wait_for_timeout(700)
    T('reset restores original content but keeps theme',look('/index.html',lambda q:'Turning' in q.inner_text('.tag') and q.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--c1').trim()")=='#ff7a45'))
    pg.screenshot(path='/tmp/adm_settings.png',full_page=True)
    # ---- Account: change password, sign out, old/new
    nav('account');pg.fill('#a-c','ChangeMe123!');pg.fill('#a-n','MyNewSecret#2026');pg.fill('#a-n2','MyNewSecret#2026');pg.click('form button[type=submit]');pg.wait_for_selector('#toast.show');T('password changed in panel',pg.locator('.errt').inner_text()=='')
    pg.click('text=Sign out');pg.wait_for_selector('#l-u');T('sign out returns to sign-in',True)
    st=pg.evaluate("fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json','X-Requested-With':'admin'},body:JSON.stringify({content:{}})}).then(r=>r.status)");T('after sign out: save attempt -> 401',st==401,st)
    pg.fill('#l-u','admin');pg.fill('#l-p','ChangeMe123!');pg.click('.lbox button');pg.wait_for_selector('.errt:not(:empty)');T('old password no longer works',True)
    pg.fill('#l-p','MyNewSecret#2026');pg.click('.lbox button');pg.wait_for_selector('#view h1');T('new password works; no default-password warning',pg.locator('.warn').count()==0)
    # ---- layout checks
    pg.screenshot(path='/tmp/adm_dash.png')
    for w in (820,390):
        pg.set_viewport_size({'width':w,'height':900});pg.wait_for_timeout(300)
        for r in ('dashboard','home','services','theme'):
            pg.goto(B+'/admin/#/'+r);pg.wait_for_timeout(500);o=pg.evaluate('[document.documentElement.scrollWidth,innerWidth]')
            if o[0]>o[1]:T(f'admin no sideways scroll {w}px #{r}',False,o)
        T(f'admin no sideways scroll at {w}px',True)
    pg.set_viewport_size({'width':390,'height':844});pg.goto(B+'/admin/#/work');pg.wait_for_timeout(600);pg.screenshot(path='/tmp/adm_mobile.png')
    T('no JS errors in the admin during the whole run',not errs,errs[:2])
    br.close()
srv.kill();print('\n%d passed, %d failed'%(sum(res),len(res)-sum(res)))
