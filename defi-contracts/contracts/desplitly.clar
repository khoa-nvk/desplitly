(define-constant ERR-NOT-FOUND-EXPENSE u101)
(define-constant ERR-ALREADY-PAID-THIS-EXPENSE u102)
(define-constant ERR-EXPENSE-NOT-FOUND u103)
(define-constant ERR-NOT-EXPENSE-CREATOR u104)


;; list of expenses  
(define-map expenses { id: (string-ascii 256) } {
  creator: principal,
  name: (string-ascii 256),
  img: (string-ascii 256),
  description: (string-ascii 512),
  total: uint, ;; total amount of the bill
  receive: uint,
  date: (string-ascii 20),
  status: bool
})
;; use this map to keep track of status of an expense between creator and sharer
(define-map mutal-expenses { id: (string-ascii 256), creator: principal, sharer: principal } 
        { paid: bool, amount: uint }
) 
;; list of expense of a user, then get details from 2 maps: `expenses` and `mutual-expenses` 
(define-map my-expenses principal (list 3000 (string-ascii 256)) )


;; Create a new expense 
(define-public (create-expense (id (string-ascii 256) ) (name (string-ascii 256)) (description (string-ascii 512)) (img (string-ascii 256)) 
        (date (string-ascii 20)) (total uint) (paid (list 10 principal)) (unpaid (list 10 { sharer: principal, owned-amount: uint } )) )
        (let ( 
            ;; (current-product-ids (get-product-ids-by-seller tx-sender)) 
            ;; (new-ids (unwrap-panic (as-max-len? (append current-product-ids id) u2500) ))
        )
            ;; add to mutual-expense with status true for paid list
            ;; (fold add-personal-expense paid { creator: tx-sender, amount: total, id: id, paid: true})
            ;; add to mutual-expense with status false for unpaid list
            (fold add-personal-expense unpaid { creator: tx-sender, amount: total, id: id, paid: false})
            ;; add to expenses map
            (map-set expenses {id: id} { creator: tx-sender, total: total, receive: u0, name: name, img: img, description: description, date: date, status: true})
            (ok true)
)) 

;; Update an expense 
(define-public (update-expense (id (string-ascii 256) ) (name (string-ascii 256)) (description (string-ascii 512)) (img (string-ascii 256)) 
        (date (string-ascii 20)) (total uint) (status bool))
        (let ( 
            (expense (unwrap! (map-get? expenses {id: id}) (err ERR-EXPENSE-NOT-FOUND) ))
            (creator (get creator expense)) 
            (receive (get receive expense))
        )
            (asserts! (is-eq creator tx-sender) (err ERR-NOT-EXPENSE-CREATOR))
            ;; add to expenses map
            (map-set expenses {id: id} { creator: tx-sender, total: total, receive: receive, name: name, img: img, description: description, date: date, status: status})
            (ok true)
)) 


;; Pay an expense
;; 1. Check if this tx-sender is a valid splitter or not 
;; 2. Transfer STX from tx-sender to the expense's creator 
;; 3. Change status of unpaid array and paid array 

(define-public (pay-expense (id (string-ascii 256)) (creator principal) )
        (let ( 
            ;; get mutal expense's details to update later
            (mutual-expense (unwrap! (map-get? mutal-expenses {id: id, sharer: tx-sender, creator: creator} ) (err ERR-NOT-FOUND-EXPENSE) )) 
            (owned-amount (get amount mutual-expense))
            (paid (get paid mutual-expense))
            ;; get  expense's details to update later
            (expense (unwrap! (map-get? expenses {id: id} ) (err ERR-NOT-FOUND-EXPENSE) )) 
            
            (total (get total expense))
            (receive (get receive expense))
            (name (get name expense))
            (img (get img expense))
            (description (get description expense))
            (date (get date expense))
            (status (get status expense))
            ;; calculate new receive amount 
            (new-receive-amount (+ receive owned-amount))
        )
            (asserts! (is-eq paid false) (err ERR-ALREADY-PAID-THIS-EXPENSE) )
            ;; TODO: check if already paid, don't allow sharer to pay anymore!
            (try! (stx-transfer? owned-amount tx-sender creator))
            ;; if creator receives enough amout for the bill, auto change status to `true`
            (if (is-eq new-receive-amount total)
                ;; update expense with  status = true
                (map-set expenses {id: id} { creator: creator, total: total, receive: new-receive-amount, name: name, img: img, description: description, date: date, status: true})
                ;; update expense with current status
                (map-set expenses {id: id} { creator: creator, total: total, receive: new-receive-amount, name: name, img: img, description: description, date: date, status: status})
            )
            
            ;; update mutual expense with status: true 
            (map-set mutal-expenses {id: id, creator: creator , sharer: tx-sender} { amount: owned-amount, paid: true}) 
            (ok true)
        ) 
)


;; Get expense's details by its id 
(define-read-only (get-expense (id (string-ascii 256)))
    ;; TODO: only owner can get expense  
    (map-get? expenses {id: id} )
)

;; Get mutual expense by its id 
(define-read-only (get-mutual-expense (id (string-ascii 256)) (creator principal) (sharer principal) )
    (map-get? mutal-expenses {id: id, creator: creator, sharer: sharer} )
)


;; Get my expenses' ids 
(define-read-only (get-my-expenses-list (address principal))
    (default-to
    (list )
    (map-get? my-expenses address) 
    )
)

(define-private (add-personal-expense (info {sharer: principal, owned-amount: uint} ) (parameters {creator: principal, amount: uint, id: (string-ascii 256), paid: bool} ))
    (let
        (
            (creator-address (get creator parameters))
            (amount-value (get amount parameters))
            (id-value (get id parameters))
            (is-paid (get paid parameters))

            (sharer-value (get sharer info))
            (owned-amount (get owned-amount info))
            
            (expense-ids (get-my-expenses-list sharer-value)) 
            (updated-expense-ids (unwrap-panic (as-max-len? (append expense-ids id-value) u3000) ))
        )
        (map-set mutal-expenses {id: id-value, creator: creator-address , sharer: sharer-value} { amount: owned-amount, paid: is-paid}) 
        (map-set my-expenses sharer-value updated-expense-ids)   
        { creator: creator-address, amount: amount-value, id: id-value, paid: is-paid})
)