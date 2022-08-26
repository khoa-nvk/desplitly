
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const ERR_ALREADY_PAID_THIS_EXPENSE = 102;
const ERR_NOT_FOND_MTAL_EXPENSE = 103;
const ERR_EXPENSE_NOT_FOND = 104;
const ERR_NOT_EXPENSE_CREATOR = 105;
const ERR_ALL_OWNED_AMONT_NOT_EQAL_TOTAL_AMONT = 106;
const ERR_EXPENSE_ID_EXIST = 107;
const ERR_EXPENSE_INACTIVE = 108;


const contractName = "desplitly";
const contractPrincipal = (deployer: Account) =>
  `${deployer.address}.${contractName}`;

Clarinet.test({
    name: "[OK] create-expense",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(4000000)  })
        ])], 
            wallet1.address)
        ]);
        let [createExpense] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "[FAIL] create-expense | total sharer's amount is not equal bill's total ",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(40000000)  })
        ])], 
            wallet1.address)
        ]);
        let [createExpense] = block.receipts;
        createExpense.result.expectErr().expectUint(ERR_ALL_OWNED_AMONT_NOT_EQAL_TOTAL_AMONT);
    },
});

Clarinet.test({
    name: "[FAIL] create-expense | exist expense id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(4000000)  })
        ])], 
            wallet1.address) ,

            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(4000000)  })
        ])], 
            wallet1.address) ]
        
        );
        let [createExpense, createDuplicateExpense] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        createDuplicateExpense.result.expectErr().expectUint(ERR_EXPENSE_ID_EXIST);
    },
});

Clarinet.test({
    name: "[OK] update-expense ",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(4000000)  })
        ])], 
            wallet1.address),

            Tx.contractCall(contractPrincipal(deployer), "update-expense", 
            [types.ascii("expense001"),types.ascii("expense 1 updated"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"), types.bool(false)
        ],wallet1.address) ])
        
        let [createExpense, updateExpense] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        updateExpense.result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "[FAIL] update-expense | not found expense ",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let block = chain.mineBlock([
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(4000000)  })
        ])], 
            wallet1.address),

            Tx.contractCall(contractPrincipal(deployer), "update-expense", 
            [types.ascii("expense002"),types.ascii("expense 1 updated"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"), types.bool(false)
        ],wallet1.address)])
        
        let [createExpense, updateExpense] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        updateExpense.result.expectErr().expectUint(ERR_EXPENSE_NOT_FOND);
    },
});

Clarinet.test({
    name: "[FAIL] update-expense | not the expense's owner ",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let wallet2 = accounts.get("wallet_2")!;
        let block = chain.mineBlock([
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii("expense001"),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"), "owned-amount": types.uint(1000000)  }), 
            types.tuple({"sharer": types.principal("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal("ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"), "owned-amount": types.uint(4000000)  })
        ])], 
            wallet1.address),

            Tx.contractCall(contractPrincipal(deployer), "update-expense", 
            [types.ascii("expense001"),types.ascii("expense 1 updated"),types.utf8("description"),types.ascii("image.link")
            ,types.ascii("22/02/2022"), types.bool(false)
        ],wallet2.address)])
        
        let [createExpense, updateExpense] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        updateExpense.result.expectErr().expectUint(ERR_NOT_EXPENSE_CREATOR);
    },
});

Clarinet.test({
    name: "[OK]] pay-expense ",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let creator = accounts.get("wallet_5")!;
        let wallet1 = accounts.get("wallet_1")!;
        let wallet2 = accounts.get("wallet_2")!;
        let wallet3 = accounts.get("wallet_3")!;
        
        const expenseID = "expense001";
        const OWNED_AMOUNT = 1000000
        
        let block = chain.mineBlock([
            // wallet 5 creates an expense
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii(expenseID),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal(wallet1.address), "owned-amount": types.uint(OWNED_AMOUNT) }), 
            types.tuple({"sharer": types.principal(wallet2.address), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal(wallet3.address), "owned-amount": types.uint(4000000)  })
        ])], 
        creator.address),

            // wallet 1 pays an expense
            Tx.contractCall(contractPrincipal(deployer), "pay-expense", 
            [types.ascii(expenseID),types.principal(creator.address)
        ],wallet1.address)])
        
        let [createExpense, payExpense] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        payExpense.result.expectOk().expectBool(true);
        const event = payExpense.events[0].stx_transfer_event
        assertEquals(Number(event.amount),OWNED_AMOUNT)
        assertEquals(event.sender,wallet1.address)
        assertEquals(event.recipient,creator.address)
    },
});
Clarinet.test({
    name: "[FAIL]] pay-expense | expense is inactive",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let creator = accounts.get("wallet_5")!;
        let wallet1 = accounts.get("wallet_1")!;
        let wallet2 = accounts.get("wallet_2")!;
        let wallet3 = accounts.get("wallet_3")!;
        
        const expenseID = "expense001";
        const OWNED_AMOUNT = 1000000
        
        let block = chain.mineBlock([
            // wallet 5 creates an expense
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii(expenseID),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal(wallet1.address), "owned-amount": types.uint(OWNED_AMOUNT) }), 
            types.tuple({"sharer": types.principal(wallet2.address), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal(wallet3.address), "owned-amount": types.uint(4000000)  })
        ])], 
        creator.address),

            // creator changes expense's status to false
            Tx.contractCall(contractPrincipal(deployer), "update-expense", 
            [types.ascii("expense001"),types.ascii("expense 1 updated"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"), types.bool(false)
        ],creator.address),

            // wallet 1 pays an expense
            Tx.contractCall(contractPrincipal(deployer), "pay-expense", 
            [types.ascii(expenseID),types.principal(creator.address)],wallet1.address)
    
    ])
        
        let [createExpense, updateExpense, payExpenseAgain] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        updateExpense.result.expectOk().expectBool(true);
        payExpenseAgain.result.expectErr().expectUint(ERR_EXPENSE_INACTIVE)
    },
});
Clarinet.test({
    name: "[FAIL]] pay-expense | already paid for this expense",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get("deployer")!;
        let creator = accounts.get("wallet_5")!;
        let wallet1 = accounts.get("wallet_1")!;
        let wallet2 = accounts.get("wallet_2")!;
        let wallet3 = accounts.get("wallet_3")!;
        
        const expenseID = "expense001";
        const OWNED_AMOUNT = 1000000
        
        let block = chain.mineBlock([
            // wallet 5 creates an expense
            Tx.contractCall(contractPrincipal(deployer), "create-expense", 
            [types.ascii(expenseID),types.ascii("expense 1"),types.utf8("description"),types.ascii("image.link"),types.ascii("22/02/2022"),types.uint(10000000), 
            types.list([types.tuple({"sharer": types.principal(wallet1.address), "owned-amount": types.uint(OWNED_AMOUNT) }), 
            types.tuple({"sharer": types.principal(wallet2.address), "owned-amount": types.uint(5000000)  }),
            types.tuple({"sharer": types.principal(wallet3.address), "owned-amount": types.uint(4000000)  })
        ])], 
        creator.address),

            // wallet 1 pays an expense
            Tx.contractCall(contractPrincipal(deployer), "pay-expense", 
            [types.ascii(expenseID),types.principal(creator.address)],wallet1.address),

            // wallet 1 pays an expense again
            Tx.contractCall(contractPrincipal(deployer), "pay-expense", 
            [types.ascii(expenseID),types.principal(creator.address)],wallet1.address)
    
    ])
        
        let [createExpense, payExpense, payExpenseAgain] = block.receipts;
        createExpense.result.expectOk().expectBool(true);
        payExpense.result.expectOk().expectBool(true);
        payExpenseAgain.result.expectErr().expectUint(ERR_ALREADY_PAID_THIS_EXPENSE)
    },
});