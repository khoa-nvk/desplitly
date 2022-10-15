;;implementedTrait
(impl-trait .sip-009.sip009-nft-trait)

;;error constants
(define-constant INVALID_TOKEN_ID (err u101))
(define-constant UNAUTHORIZED (err u401))
(define-constant owner tx-sender)

(define-non-fungible-token DeSplitly-NFT uint)


;;variables
(define-data-var nft-price uint u10) ;; Price is in DSL Token
(define-data-var nft-count uint u0)
(define-data-var ipfs-root (string-ascii 80) "ipfs.io/ipfs/Qmf7jNRBzRYmjsxtRXo1MBjWMwrTm87V9BPRM4oqtyZdLN")


;;read-only functions
(define-read-only (get-last-token-id)
	(ok (var-get nft-count))
)
(define-read-only (get-token-uri (id uint))
    (ok (some (concat (concat (var-get ipfs-root) "{id}") ".json"))) ;; Just stimulating, there is no json file on IPFS yet. 
)

(define-read-only (get-owner (id uint))
    (ok (nft-get-owner? DeSplitly-NFT id))
)

(define-public (update-nft-price (new-price uint))
   (begin 
      (asserts! (is-eq tx-sender owner) (err UNAUTHORIZED))
      (ok (var-set nft-price new-price))
   )

)
(define-read-only (get-nft-price)
    (ok (var-get nft-price))
)

;;public functions
(define-public (mint (recipient principal) )
   (begin 
   (try! 
      (nft-mint? DeSplitly-NFT (var-get nft-count) recipient)  
   )
   (var-set nft-count (+ (var-get nft-count) u1) )
   (ok (- (var-get nft-count) u1))
   )
)


(define-public (mint-with-dsl)
   (let 
      (
      (price (var-get nft-price))
      (nft-claimer tx-sender)
      )
      ;; send DSL Token back to deployer 
      (try! (contract-call? .dsl transfer price nft-claimer 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM none))
      ;; mint the NFT if user has enough DSL tokens
      (try! (nft-mint? DeSplitly-NFT (var-get nft-count) nft-claimer))
      (var-set nft-count (+ (var-get nft-count) u1) )
      (ok (- (var-get nft-count) u1))
   )
)


(define-public (transfer (id uint) (sender principal) (recipient principal))
   (nft-transfer? DeSplitly-NFT id sender recipient)
)
