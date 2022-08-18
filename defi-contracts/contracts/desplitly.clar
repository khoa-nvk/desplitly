(define-constant ERR-NOT-FOUND-EXPENSE u101)
(define-constant ERR-ALREADY-PAID-THIS-EXPENSE u102)


;; list of expenses  
(define-map expenses { id: (string-ascii 256) } {
  creator: principal,
  name: (string-ascii 256),
  img: (string-ascii 256),
  description: (string-ascii 512),
  total: uint,
  date: (string-ascii 20),
  status: bool
})
(define-map mutal-expenses { id: (string-ascii 256), creator: principal, sharer: principal } 
        { paid: bool, amount: uint }
) 
;; list of expense of a user
(define-map my-expenses principal (list 3000 (string-ascii 256)) )


;; Create a new expense 
(define-public (create-expense (id (string-ascii 256) ) (name (string-ascii 256)) (description (string-ascii 512)) (img (string-ascii 256)) 
        (date (string-ascii 20)) (total uint) (paid (list 10 principal)) (unpaid (list 10 principal)) )
        (let ( 
            ;; (current-product-ids (get-product-ids-by-seller tx-sender)) 
            ;; (new-ids (unwrap-panic (as-max-len? (append current-product-ids id) u2500) ))
            ;; (people (list 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5))
        )
            ;; (print current-product-ids)
            ;; (print new-ids)
            ;; (map-set expenses {id: id} { creator: tx-sender, name: name, description: description, img: img, date: date, total: total })           
            (fold add-personal-expense paid { creator: tx-sender, amount: total, id: id, paid: true})
            (fold add-personal-expense unpaid { creator: tx-sender, amount: total, id: id, paid: false})
            (map-set expenses {id: id} { creator: tx-sender, total: total, name: name, img: img, description: description, date: date, status: true})
            (ok true)
)) 


(define-private (add-personal-expense (sharer principal) (parameters {creator: principal, amount: uint, id: (string-ascii 256), paid: bool} ))
    (let
        (
            (creator-address (get creator parameters))
            (amount-value (get amount parameters))
            (id-value (get id parameters))
            (is-paid (get paid parameters))
            
            (expense-ids (get-my-expenses sharer)) 
            (updated-expense-ids (unwrap-panic (as-max-len? (append expense-ids id-value) u3000) ))
        )
        (map-set mutal-expenses {id: id-value, creator: creator-address , sharer: sharer} { amount: amount-value, paid: is-paid}) 
        (map-set my-expenses sharer updated-expense-ids)   
        { creator: creator-address, amount: amount-value, id: id-value, paid: is-paid})
    )

;; Pay an expense
;; 1. Check if this tx-sender is a valid splitter or not 
;; 2. Transfer STX from tx-sender to the expense's creator 
;; 3. Change status of unpaid array and paid array 

(define-public (pay-expense (id (string-ascii 256)) (creator principal) )
        (let ( 
            (expense (unwrap! (map-get? mutal-expenses {id: id, sharer: tx-sender, creator: creator} ) (err ERR-NOT-FOUND-EXPENSE) )) 
            (amount (get amount expense))
            (paid (get paid expense))
            
        )
            (asserts! (is-eq paid false) (err ERR-ALREADY-PAID-THIS-EXPENSE) )
            (try! (stx-transfer? amount tx-sender creator))
            (map-set mutal-expenses {id: id, creator: creator , sharer: tx-sender} { amount: amount, paid: true}) 
            (ok true)
        ) 
)

;; TODO: get list of expenses of a user 


;; Get expense's details by its id 
(define-read-only (get-expense (id (string-ascii 256)))
    (map-get? expenses {id: id} )
)

;; ;; Get my expenses
;; (define-read-only (get-my-expenses (address principal))
;;     (map-get? my-expenses address )
;; )

;; Get mutual expense by its id 
(define-read-only (get-mutual-expense (id (string-ascii 256)) (creator principal) (sharer principal) )
    (map-get? mutal-expenses {id: id, creator: creator, sharer: sharer} )
)


;; Get my expenses' ids 
(define-read-only (get-my-expenses (address principal))
    (default-to
    (list )
    (map-get? my-expenses address) 
    )
)
