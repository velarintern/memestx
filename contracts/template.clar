(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ft-plus-trait.ft-plus-trait)

(define-constant MAX_SUPPLY (* u10000000000 (pow u10 u0)))

(define-fungible-token memecoin MAX_SUPPLY)

(define-constant err-check-owner (err u1))
(define-constant err-transfer    (err u4))

(define-data-var owner principal tx-sender)

(define-private (check-owner)
  (ok (asserts! (is-eq tx-sender (var-get owner)) err-check-owner)))

(define-public (set-owner (new-owner principal))
  (begin
    (try! (check-owner))
    (ok (var-set owner new-owner)) ))

(define-public
  (transfer
    (amt  uint)
    (from principal)
    (to   principal)
    (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender from) err-transfer)
    (ft-transfer? memecoin amt from to)))

(define-public (mint (amt uint) (to principal))
  (begin
    (try! (check-owner))
    (ft-mint? memecoin amt to) ))

(define-read-only (get-name)                   (ok "memecoin"))
(define-read-only (get-symbol)                 (ok "MEME"))
(define-read-only (get-decimals)               (ok u6))
(define-read-only (get-balance (of principal)) (ok (ft-get-balance memecoin of)))
(define-read-only (get-total-supply)           (ok (ft-get-supply memecoin)))
(define-read-only (get-max-supply)             (ok MAX_SUPPLY))
(define-read-only (get-token-uri)              (ok (some u"hellooooo")))
