import asyncio, json
from pathlib import Path
import httpx
from playwright.async_api import async_playwright

ROOT='http://localhost:4200'
def rpc(route, data):
    r=httpx.post(ROOT+'/api/rpc/'+route,json={'json':data},timeout=30)
    return r.status_code,r.json()

async def main():
    results=[]; errors=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda e:errors.append(str(e)))
        async def go(path,id):
            await page.goto(ROOT)
            await page.evaluate('(id)=>localStorage.setItem("kinship.memberId",String(id))',id)
            await page.goto(ROOT+path); await page.wait_for_load_state('networkidle')
        # Direct backing on a clean QA project; only $10 total is allowed.
        await go('/forge/project/13',1)
        async with page.expect_response(lambda r:'/draw/invest' in r.url) as response:
            await page.get_by_role('button',name='Back $10',exact=True).click()
        assert (await response.value).status==200
        await page.get_by_text('You hold the $10 maximum here.',exact=False).wait_for()
        status,body=rpc('draw/invest',{'memberId':1,'projectId':13,'amountCents':100})
        assert status==400
        results.append({'flow':'direct backing and repeated-ticket ceiling','blockedStatus':status})
        # Distribution from project creator, check the holder's income delta.
        _,before=rpc('payouts/portfolio',{'memberId':1})
        await go('/studio',12)
        await page.get_by_label('Income period',exact=True).fill('2026-10')
        await page.get_by_label('Gross revenue in dollars',exact=True).fill('10000')
        async with page.expect_response(lambda r:'/payouts/report' in r.url) as response:
            await page.get_by_role('button',name='Run distribution',exact=True).click()
        rr=await response.value; assert rr.status==200,await rr.text()
        await page.get_by_text('Paid ',exact=False).wait_for()
        _,after=rpc('payouts/portfolio',{'memberId':1})
        assert after['json']['totals']['incomeCents']>before['json']['totals']['incomeCents']
        results.append({'flow':'income run, portfolio delta','cents':after['json']['totals']['incomeCents']-before['json']['totals']['incomeCents']})
        # Creator sells one percent; an Operator buys it.
        await go('/forge/project/13',12)
        await page.get_by_label('Equity percentage to sell').fill('1')
        await page.get_by_label('Asking price in dollars').fill('10')
        async with page.expect_response(lambda r:'/exchange/listEquity' in r.url) as response:
            await page.get_by_role('button',name='List on the Equity Book').click()
        assert (await response.value).status==200
        await go('/exchange',5)
        row=page.locator('li').filter(has_text='QA workshop qa_1791220611').filter(has=page.get_by_role('button',name='Buy',exact=True)).first
        async with page.expect_response(lambda r:'/exchange/buyEquity' in r.url) as response:
            await row.get_by_role('button',name='Buy',exact=True).click()
        rr=await response.value; assert rr.status==200,await rr.text()
        results.append({'flow':'equity listing and purchase','projectId':13})
        # IP Desk draft creation and simulated review queue.
        await go('/ipdesk',12)
        await page.get_by_label('Draft title',exact=True).fill('QA mutual NDA')
        for field,value in [('Party A legal name and address','QA Research, Example Road'),('Party B legal name and address','QA Partner, Example Lane'),('Purpose of disclosure','Review a workshop prototype in this simulated test'),('Confidentiality term in years','2'),('Governing law (state / country)','Delaware, United States'),('Effective date','2026-10-05')]:
            await page.get_by_label(field,exact=False).fill(value)
        async with page.expect_response(lambda r:'/ipdesk/generate' in r.url) as response:
            await page.get_by_role('button',name='Save draft',exact=False).click()
        assert (await response.value).status==200
        await page.get_by_text('QA mutual NDA',exact=True).wait_for()
        async with page.expect_response(lambda r:'/ipdesk/requestAttorneyReview' in r.url) as response:
            await page.get_by_role('button',name='Request review').click()
        assert (await response.value).status==200
        results.append({'flow':'NDA generated and simulated review requested'})
        # Grace opens, immediate escalation is blocked; resolve from House UI.
        await go('/house',1)
        card=page.locator('.k-card').filter(has_text='QA workshop qa_1791220611').filter(has=page.get_by_role('button',name='Open grace')).first
        await card.get_by_label('Review or recovery note').fill('QA accommodation with documented recovery plan.')
        async with page.expect_response(lambda r:'/house/issueGrace' in r.url) as response:
            await card.get_by_role('button',name='Open grace').click()
        assert (await response.value).status==200
        status,body=rpc('house/issueDefaultNotice',{'memberId':1,'projectId':13,'reason':'QA premature default must be blocked'})
        assert status==400
        status2,_=rpc('house/foreclose',{'memberId':1,'projectId':4,'reason':'QA premature foreclosure must be blocked'})
        # Project 4 is not necessarily the seeded default; any non-default is blocked too.
        assert status2==400
        await go('/house',1)
        card=page.locator('.k-card').filter(has_text='Grace period opened').filter(has_text='QA accommodation').first
        await card.get_by_label('Review or recovery note').fill('QA revised milestone accepted; standing restored.')
        async with page.expect_response(lambda r:'/house/cureNotice' in r.url) as response:
            await card.get_by_role('button',name='Resolve & reinstate').click()
        assert (await response.value).status==200
        results.append({'flow':'grace and cure; early default and foreclosure blocked','statuses':[status,status2]})
        # Access policy and repeat-reward protection at the API boundary.
        status,_=rpc('members/scores',{'memberId':12,'targetHandle':'mara_k'})
        assert status==403
        _,public=rpc('members/list',{})
        assert all('trustScore' not in m and 'socialScore' not in m and 'email' not in m for m in public['json'])
        _,task=rpc('clout/claim',{'memberId':12,'kind':'diligence','title':'QA note for review'})
        tid=task['json']['id']
        assert rpc('clout/submit',{'memberId':12,'taskId':tid,'proof':'QA evidence is recorded in the workshop project.'})[0]==200
        assert rpc('clout/submit',{'memberId':12,'taskId':tid,'proof':'QA evidence is recorded in the workshop project.'})[0]==409
        results.append({'flow':'private scores, minimal directory, no duplicate task rewards'})
        await browser.close()
    Path('/home/user/kinship-collective/operations-verification.json').write_text(json.dumps({'results':results,'browserErrors':errors},indent=2))
    print(json.dumps({'results':results,'browserErrors':errors},indent=2)); assert not errors

asyncio.run(main())