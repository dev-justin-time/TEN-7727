import asyncio, json, time
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = 'http://localhost:4200'
async def main():
    results, errors, events = [], [], []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('console', lambda msg: events.append(msg.text) if '[kinship:' in msg.text else None)
        async def go(path):
            await page.goto(ROOT+path)
            await page.wait_for_load_state('networkidle')
        async def passport(id):
            await page.evaluate('(id) => localStorage.setItem("kinship.memberId", String(id))', id)
            await page.reload(); await page.wait_for_load_state('networkidle')
        await go('/join')
        tag = 'qa_'+str(int(time.time()))
        project_title = 'QA workshop '+tag
        await page.get_by_label('Display name', exact=True).fill('QA Research')
        await page.get_by_label('Handle', exact=True).fill(tag)
        await page.get_by_label('Email', exact=True).fill(tag+'@example.test')
        await page.get_by_role('button',name='Create passport').click()
        await page.wait_for_url('**/forge'); await page.wait_for_load_state('networkidle')
        mid = await page.evaluate('Number(localStorage.getItem("kinship.memberId"))')
        assert mid > 7
        results.append({'flow':'join','memberId':mid})
        seen = []
        for decision in ['Yes — back $10','Bye, for good','Bye, for good']:
            await page.get_by_role('button', name='Draw a card', exact=True).click()
            await page.get_by_role('button', name=decision, exact=True).wait_for()
            seen.append(await page.locator('h2').first.inner_text())
            await page.get_by_role('button', name=decision, exact=True).click()
            await page.get_by_role('button', name=decision, exact=True).wait_for(state='hidden')
            await page.wait_for_load_state('networkidle')
        assert len(set(seen)) == 3
        assert await page.get_by_text('Out of draws this week',exact=True).is_visible()
        results.append({'flow':'draw yes, bye, no repeat, weekly cap','rounds':seen})
        await go('/portfolio')
        assert await page.get_by_text('Positions',exact=True).is_visible()
        await page.get_by_role('button',name='+$200.00',exact=True).click()
        await page.wait_for_load_state('networkidle')
        await go('/forge/pitch')
        await page.get_by_label('Title',exact=True).fill(project_title)
        await page.get_by_label('One-line tagline',exact=True).fill('A test workshop for verified milestone operations')
        await page.get_by_label('The pitch',exact=True).fill('A simulated workshop with documented milestones. Demand and execution remain uncertain; this test does not project a return.')
        await page.get_by_label('Accept legal and milestone terms').check()
        buttons = await page.get_by_role('button').all_text_contents()
        results.append({'flow':'pitch form filled','buttons':buttons})
        await page.screenshot(path='/home/user/kinship-pitch.png',full_page=True)
        # Submit the form directly through its visible submit button.
        await page.locator('button[type="submit"]').click()
        await page.wait_for_url('**/forge/project/*')
        await page.wait_for_load_state('networkidle')
        pid=int(page.url.rsplit('/',1)[1])
        results.append({'flow':'pitch created','projectId':pid})
        await go('/studio')
        await page.get_by_label('Milestone evidence',exact=True).fill('QA evidence: test protocol, sample results and independent review ready.')
        await page.get_by_role('button',name='Submit to escrow').click()
        await page.wait_for_load_state('networkidle')
        await passport(1)
        await go('/house')
        cards=page.locator('.k-card').filter(has_text=project_title).filter(has_text='Stage 1')
        escrow_card=cards.filter(has=page.get_by_role('button',name='Approve & release')).first
        await escrow_card.get_by_label('Review or recovery note').fill('Evidence checked in simulated QA review.')
        async with page.expect_response(lambda r: '/escrow/review' in r.url) as reviewed:
            await escrow_card.get_by_role('button',name='Approve & release').click()
        reviewed_response = await reviewed.value
        assert reviewed_response.status == 200, await reviewed_response.text()
        await page.wait_for_load_state('networkidle')
        await page.locator('output').filter(has_text='Approved.').wait_for()
        await go(f'/forge/project/{pid}')
        await page.get_by_text('Stage 2/5',exact=True).wait_for()
        results.append({'flow':'milestone submission and admin approval','projectId':pid})
        # Every route, including protected views, should render without React errors.
        for route in ['/','/join','/forge','/forge/pitch',f'/forge/project/{pid}','/projects','/portfolio','/studio','/exchange','/ipdesk','/scores','/house','/hub','/compliance','/sole','/orbital','/not-a-room']:
            await go(route)
            if '/forge/project/' in route: await page.locator('h1').wait_for()
            assert len(await page.locator('body').inner_text()) > 100
            results.append({'route':route,'heading':await page.locator('h1').all_text_contents()})
        for world in ['underground','lab','prestige']:
            await go('/')
            await page.get_by_label('Visual world').select_option(world)
            assert await page.locator('html').get_attribute('data-world')==world
            await page.evaluate('() => document.getAnimations().forEach(a => a.finish())')
            await page.screenshot(path=f'/home/user/kinship-{world}.png', full_page=False)
            await page.set_viewport_size({'width':390,'height':844})
            await page.get_by_role('button',name='Menu',exact=True).click()
            await page.get_by_role('navigation').get_by_role('link',name='Hub',exact=True).click()
            await page.wait_for_load_state('networkidle')
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
            await page.screenshot(path=f'/home/user/kinship-{world}-mobile.png')
            await page.set_viewport_size({'width':1440,'height':1000})
            results.append({'theme':world,'mobileOverflow':False})
        await browser.close()
    Path('/home/user/kinship-collective/verification.json').write_text(json.dumps({'results':results,'browserErrors':errors,'operationalLogs':events},indent=2))
    print(json.dumps({'results':results,'browserErrors':errors,'logCount':len(events)},indent=2))
    assert not errors, errors

asyncio.run(main())