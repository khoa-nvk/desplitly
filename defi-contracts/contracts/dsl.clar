;;implementedTrait
(impl-trait .sip-010.sip010-ft-trait)

;;error constants
(define-constant ERR_NOT_OWNER (err u401))

;;constants
(define-constant name "DeSplitly Token")
(define-constant symbol "DSL")
(define-constant decimal u6)
(define-constant owner tx-sender)

(define-fungible-token DSL u100000000000000)

;;read-only functions
(define-read-only (get-owner)
	(ok owner)
)
(define-read-only (get-contract-name)
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.desplitly ;; change to your deployed address later
)
(define-read-only (get-name)
	(ok name)
)
(define-read-only (get-symbol)
	(ok symbol)
)
(define-read-only (get-decimals)
	(ok decimal)
)
(define-read-only (get-balance (sender principal))
	(ok (ft-get-balance DSL sender))
)
(define-read-only (get-total-supply)
	(ok (ft-get-supply DSL))
)
(define-read-only (get-token-uri)
	(ok none)
)

;;public functions
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (try! (ft-transfer? DSL amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)
    )
)
(define-public (mint (amount uint) (recipient principal)) 
  (begin
    (asserts! (is-eq tx-sender contract-caller (get-contract-name )) ERR_NOT_OWNER)
	  (ft-mint? DSL amount recipient)
  )
)