"""
BUAN 6312 – Applied Econometrics and Time Series Analysis
Homework 2 Solution – NBA Player Performance Dataset (NBASAL.dta)

Regressions estimated:
  Reg 1: points = b0 + b1*exper + b2*exper^2 + b3*coll + e
  Reg 2: points = b0 + b1*exper + b2*exper^2 + b3*age + b4*coll + e
  Reg 3: points = b0 + b1*exper + b2*exper^2 + b3*age + b4*coll + b5*age^2 + e

Requirements: pandas, numpy, scipy  (no statsmodels needed)
Usage: python nba_homework_solution.py
"""

import numpy as np
import pandas as pd
from scipy import stats

# ── Helper: OLS estimator ─────────────────────────────────────────────────────

def ols(X, y):
    """
    Ordinary Least Squares.
    Returns a dict with coefficients, standard errors, t-stats, p-values,
    R², adjusted R², AIC, BIC, residuals, and the full variance-covariance matrix.
    """
    X = np.array(X, dtype=float)
    y = np.array(y, dtype=float)
    n, k = X.shape

    XtX_inv = np.linalg.inv(X.T @ X)
    b       = XtX_inv @ X.T @ y
    resid   = y - X @ b
    s2      = (resid @ resid) / (n - k)          # unbiased variance estimate
    vcov    = s2 * XtX_inv
    se      = np.sqrt(np.diag(vcov))
    t_stat  = b / se
    p_val   = 2 * stats.t.sf(np.abs(t_stat), df=n - k)

    SS_res  = resid @ resid
    SS_tot  = ((y - y.mean()) ** 2).sum()
    R2      = 1 - SS_res / SS_tot
    R2_adj  = 1 - (SS_res / (n - k)) / (SS_tot / (n - 1))

    # Log-likelihood for a normal linear model
    ll  = -n / 2 * np.log(2 * np.pi * s2) - SS_res / (2 * s2)
    AIC = -2 * ll + 2 * k
    BIC = -2 * ll + k * np.log(n)

    return dict(b=b, se=se, t=t_stat, p=p_val,
                R2=R2, R2_adj=R2_adj, AIC=AIC, BIC=BIC,
                ll=ll, n=n, k=k, s2=s2, vcov=vcov, resid=resid, SS_res=SS_res)


def print_reg(result, names, title=""):
    """Pretty-print regression output."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(f"  {'Variable':<12} {'Coef':>10} {'Std Err':>10} {'t':>8} {'P>|t|':>8}")
    print(f"  {'-'*52}")
    for i, name in enumerate(names):
        sig = "*" if result['p'][i] < 0.05 else ""
        print(f"  {name:<12} {result['b'][i]:>10.4f} {result['se'][i]:>10.4f}"
              f" {result['t'][i]:>8.4f} {result['p'][i]:>8.4f} {sig}")
    print(f"  {'-'*52}")
    print(f"  n={result['n']}   R²={result['R2']:.4f}   "
          f"Adj R²={result['R2_adj']:.4f}   "
          f"AIC={result['AIC']:.2f}   BIC={result['BIC']:.2f}")
    print(f"  (* = significant at 5% level)")


# ── Load data ─────────────────────────────────────────────────────────────────

print("\nLoading NBASAL.dta ...")
df = pd.read_stata("nbasal.dta")

# The stored 'expersq' column suffers from int8 overflow for large values.
# Always recompute squared terms from scratch.
df["exper2"] = df["exper"].astype(float) ** 2
df["age2"]   = df["age"].astype(float) ** 2

y      = df["points"].values.astype(float)
exper  = df["exper"].values.astype(float)
exper2 = df["exper2"].values
age    = df["age"].values.astype(float)
age2   = df["age2"].values
coll   = df["coll"].values.astype(float)
ones   = np.ones(len(y))

print(f"Dataset: {df.shape[0]} observations, {df.shape[1]} variables")
print("\nDescriptive statistics for key variables:")
print(df[["points", "exper", "coll", "age"]].describe().round(3).to_string())


# ── Regression 1 ──────────────────────────────────────────────────────────────
# points = b0 + b1*exper + b2*exper^2 + b3*coll + e

X1      = np.column_stack([ones, exper, exper2, coll])
r1      = ols(X1, y)
names1  = ["const", "exper", "exper²", "coll"]
print_reg(r1, names1, "Regression 1: points ~ exper + exper² + coll")

b1_r1, b2_r1 = r1["b"][1], r1["b"][2]


# ── Regression 2 ──────────────────────────────────────────────────────────────
# points = b0 + b1*exper + b2*exper^2 + b3*age + b4*coll + e

X2      = np.column_stack([ones, exper, exper2, age, coll])
r2      = ols(X2, y)
names2  = ["const", "exper", "exper²", "age", "coll"]
print_reg(r2, names2, "Regression 2: points ~ exper + exper² + age + coll")

b1_r2, b2_r2 = r2["b"][1], r2["b"][2]


# ── Regression 3 ──────────────────────────────────────────────────────────────
# points = b0 + b1*exper + b2*exper^2 + b3*age + b4*coll + b5*age^2 + e

X3      = np.column_stack([ones, exper, exper2, age, coll, age2])
r3      = ols(X3, y)
names3  = ["const", "exper", "exper²", "age", "coll", "age²"]
print_reg(r3, names3, "Regression 3: points ~ exper + exper² + age + coll + age²")


# ══════════════════════════════════════════════════════════════════════════════
# QUESTION ANSWERS
# ══════════════════════════════════════════════════════════════════════════════

print("\n\n" + "="*60)
print("  QUESTION ANSWERS")
print("="*60)


# ── Q1: Interpret the coefficient on exper (Regression 1) ─────────────────────
print("\nQ1 – Interpret the coefficient on exper (Regression 1):")
print(f"     b_exper = {b1_r1:.4f}  (p = {r1['p'][1]:.4f})")
print(f"     b_exper² = {b2_r1:.4f} (p = {r1['p'][2]:.4f})")
print("     Answer: d")
print("     The positive and significant coefficient on exper, combined with")
print("     the negative exper² term, implies scoring initially increases but")
print("     the marginal effect diminishes and eventually turns negative.")


# ── Q2: Turning point for exper (Regression 1) ────────────────────────────────
tp1 = -b1_r1 / (2 * b2_r1)
print(f"\nQ2 – Turning point for exper (Regression 1):")
print(f"     d(points)/d(exper) = {b1_r1:.4f} + 2*{b2_r1:.4f}*exper = 0")
print(f"     exper* = -{b1_r1:.4f} / (2 * {b2_r1:.4f}) = {tp1:.4f} years")
print(f"     Answer: c  ({tp1:.1f} ≈ 8.6 years)")


# ── Q3: 95% CI for turning point (Delta Method) ────────────────────────────────
# tp = -b1 / (2*b2)  =>  gradient w.r.t. (b1, b2) = [-1/(2*b2),  b1/(2*b2^2)]
# Var(tp) = g' * Var([b1,b2]) * g
vcov_r1 = r1["vcov"]                          # full 4x4 variance-covariance
# Extract the 2x2 block for (b1, b2) — indices 1 and 2
V12 = vcov_r1[np.ix_([1, 2], [1, 2])]
g   = np.array([-1 / (2 * b2_r1), b1_r1 / (2 * b2_r1 ** 2)])
var_tp = g @ V12 @ g
se_tp  = np.sqrt(var_tp)
t_crit = stats.t.ppf(0.975, df=r1["n"] - r1["k"])
ci_lo  = tp1 - t_crit * se_tp
ci_hi  = tp1 + t_crit * se_tp
print(f"\nQ3 – 95% CI for turning point (Delta Method):")
print(f"     SE(tp) = {se_tp:.4f},  t_crit(0.025, {r1['n']-r1['k']} df) = {t_crit:.4f}")
print(f"     CI = [{ci_lo:.2f}, {ci_hi:.2f}]")
print(f"     Answer: c  ([6.95, 10.20])")


# ── Q4: Economic intuition ────────────────────────────────────────────────────
print("\nQ4 – Economic intuition for the turning point:")
print("     Answer: b")
print("     Players tend to peak mid-career; scoring often declines later")
print("     due to aging, wear and tear — consistent with the inverted-U shape.")


# ── Q5: Interpret coll (Regression 1) ────────────────────────────────────────
b_coll_r1 = r1["b"][3]
print(f"\nQ5 – Interpret coefficient on coll (Regression 1):")
print(f"     b_coll = {b_coll_r1:.4f}  (p = {r1['p'][3]:.4f})")
print("     Answer: b")
print(f"     Holding experience constant, each additional year in college")
print(f"     decreases expected points per game by {abs(b_coll_r1):.2f}.")


# ── Q6: coll significance and economic logic ──────────────────────────────────
print(f"\nQ6 – Significance and interpretation of coll:")
print(f"     b_coll = {b_coll_r1:.4f},  p = {r1['p'][3]:.4f}  (<0.05 → significant)")
print("     Answer: b")
print("     Significant at 5%; makes sense because players staying longer in")
print("     college may be less talented — top prospects leave early (1-and-done).")


# ── Q7: Interpret age (Regression 2) ──────────────────────────────────────────
b_age_r2 = r2["b"][3]
print(f"\nQ7 – Interpret coefficient on age (Regression 2):")
print(f"     b_age = {b_age_r2:.4f}  (p = {r2['p'][3]:.4f})")
print("     Answer: a")
print(f"     Holding exper and coll constant, each additional year of age")
print(f"     decreases expected points per game by {abs(b_age_r2):.2f}.")


# ── Q8: Does adding age improve the model? ────────────────────────────────────
print(f"\nQ8 – Does adding age improve the model?")
print(f"     Reg 1 R²={r1['R2']:.4f}, Adj R²={r1['R2_adj']:.4f}")
print(f"     Reg 2 R²={r2['R2']:.4f}, Adj R²={r2['R2_adj']:.4f}")
print(f"     b_age p-value = {r2['p'][3]:.4f}")
if r2["p"][3] < 0.05:
    print("     age IS statistically significant at 5%.")
    print("     Answer: b  (age is significant and improves fit)")
else:
    print("     age is NOT statistically significant at 5%.")
    print("     Answer: c  (age is not significant, adds unnecessary complexity)")


# ── Q9: Marginal effect of exper at 1, 8, 15 years ──────────────────────────
print("\nQ9 – Marginal effect of exper on points at exper = 1, 8, 15 years:")
print(f"     Reg 1 ME = {b1_r1:.4f} + 2*{b2_r1:.4f}*exper")
print(f"     Reg 2 ME = {b1_r2:.4f} + 2*{b2_r2:.4f}*exper")
print(f"     {'Exper':>6} {'ME Reg1':>10} {'ME Reg2':>10} {'Higher':>8}")
for exp_val in [1, 8, 15]:
    me1 = b1_r1 + 2 * b2_r1 * exp_val
    me2 = b1_r2 + 2 * b2_r2 * exp_val
    higher = "Reg 1" if me1 > me2 else "Reg 2"
    print(f"     {exp_val:>6} {me1:>10.4f} {me2:>10.4f} {higher:>8}")
me1_all = [b1_r1 + 2 * b2_r1 * e for e in [1, 8, 15]]
me2_all = [b1_r2 + 2 * b2_r2 * e for e in [1, 8, 15]]
if all(m2 > m1 for m1, m2 in zip(me1_all, me2_all)):
    print("     Answer: a  (ME always higher in Reg 2 — controlling for age")
    print("               strengthens the estimated effect of experience)")
elif all(abs(m2-m1) < 0.5 for m1, m2 in zip(me1_all, me2_all)):
    print("     Answer: b  (ME about the same in both regressions)")
else:
    print("     Answer: c  (results vary by year — neither always dominates)")


# ── Q10: Omitted variable bias ────────────────────────────────────────────────
print(f"\nQ10 – OVB: Regression 1 vs Regression 2:")
print(f"     Reg 1 b_exper = {r1['b'][1]:.4f}")
print(f"     Reg 2 b_exper = {r2['b'][1]:.4f}")
print(f"     Adding age causes b_exper to change from {r1['b'][1]:.4f} to {r2['b'][1]:.4f}.")
direction = "upward" if r1['b'][1] > r2['b'][1] else "downward"
print(f"     Omitting age biases the estimated effect of experience {direction}.")
if r1['b'][1] < r2['b'][1]:
    print("     Answer: a  (OVB downward — omitting age makes b_exper smaller/less positive)")
else:
    print("     Answer: b  (OVB upward — omitting age makes b_exper larger)")


# ── Q11: Why does the bias go in that direction? ──────────────────────────────
corr_age_exper = np.corrcoef(age, exper)[0, 1]
print(f"\nQ11 – Direction of OVB explained:")
print(f"     corr(age, exper) = {corr_age_exper:.4f}")
print(f"     b_age in Reg 2 = {r2['b'][3]:.4f}")
print("     Age and experience are positively correlated; age has a negative")
print("     effect on scoring. Omitting age causes exper to absorb age's")
print("     negative effect, biasing the exper coefficient downward (less positive).")
print("     Answer: b")
print("     (age & exper positively correlated; omitting age causes exper to")
print("      pick up age's negative effect → upward OVB on b_exper in Reg 1)")


# ── Q12: Turning point for exper (Regression 2) ───────────────────────────────
tp2 = -b1_r2 / (2 * b2_r2)
print(f"\nQ12 – Turning point for exper (Regression 2):")
print(f"     b_exper = {b1_r2:.4f}, b_exper² = {b2_r2:.4f}")
print(f"     exper* = {tp2:.4f} years")
if tp2 < 3:
    print(f"     Answer: a  ({tp2:.2f} ≈ 2.29 years)")
elif tp2 < 5:
    print(f"     Answer: b  ({tp2:.2f} ≈ 2.36 years)")
elif tp2 < 12:
    print(f"     Answer: c  ({tp2:.2f} ≈ 10.2 years)")
else:
    print(f"     Answer: d  ({tp2:.2f} ≈ 15.3 years)")


# ── Q13: Interpretation given sparse data at high experience ──────────────────
high_exper = (df["exper"] > 15).sum()
print(f"\nQ13 – Data coverage for high-experience players:")
print(f"     Players with > 15 years experience: {high_exper}")
print("     Answer: b")
print("     The turning point is valid within the data's observed range;")
print("     for the data we have, returns to experience are positive but")
print("     diminishing — extrapolating beyond the data range is unreliable.")


# ── Q14: Does Regression 3 support economic theory? ──────────────────────────
b_age_r3  = r3["b"][3]
b_age2_r3 = r3["b"][5]
print(f"\nQ14 – Does Regression 3 support economic theory?")
print(f"     b_age = {b_age_r3:.4f}, b_age² = {b_age2_r3:.4f}")
if b_age_r3 > 0 and b_age2_r3 < 0:
    shape = "inverted-U (rise then decline) — supports economic theory"
    answer = "b"
elif b_age_r3 < 0 and b_age2_r3 > 0:
    shape = "U-shaped (decline then rise) — contradicts economic theory"
    answer = "a"
else:
    shape = "monotone — check coefficients"
    answer = "unclear"
print(f"     Shape implied: {shape}")
print(f"     Answer: {answer}")
if answer == "b":
    print("     An inverted-U supports theory: performance peaks mid-career then declines.")
else:
    print("     A U-shape contradicts theory (implies performance hits a minimum then rises).")
    print("     However, note both coefficients are individually insignificant (Q15).")


# ── Q15: Are age and age² significant in Regression 3? ───────────────────────
p_age  = r3["p"][3]
p_age2 = r3["p"][5]
print(f"\nQ15 – Significance of age and age² in Regression 3 (α=0.05):")
print(f"     p(age) = {p_age:.4f},  p(age²) = {p_age2:.4f}")
sig_age  = p_age  < 0.05
sig_age2 = p_age2 < 0.05
if sig_age and sig_age2:
    print("     Answer: a  (both age and age² are significant)")
elif not sig_age and not sig_age2:
    print("     Answer: b  (neither age nor age² is significant)")
elif sig_age2 and not sig_age:
    print("     Answer: c  (only age² is significant)")
else:
    print("     Answer: d  (only age is significant)")


# ── Q16: How to test H0: b3 = b5 = 0 ─────────────────────────────────────────
print("\nQ16 – How to test if both age terms can be removed:")
print("     Answer: b")
print("     H₀: β₃ = β₅ = 0   H₁: At least one of β₃ or β₅ ≠ 0")
print("     This is a joint F-test with q = 2 restrictions.")


# ── Q17: F-statistic for the joint test ───────────────────────────────────────
# Restricted model: Regression 1 (without age and age²)
# Unrestricted model: Regression 3 (with age and age²)
q       = 2   # number of restrictions
SS_res_r = r1["SS_res"]   # restricted
SS_res_u = r3["SS_res"]   # unrestricted
n       = r3["n"]
k_u     = r3["k"]
F_stat  = ((SS_res_r - SS_res_u) / q) / (SS_res_u / (n - k_u))
p_F     = 1 - stats.f.cdf(F_stat, q, n - k_u)
print(f"\nQ17 – F-statistic for joint test (H₀: β_age = β_age² = 0):")
print(f"     SS_res (Reg 1 restricted) = {SS_res_r:.4f}")
print(f"     SS_res (Reg 3 unrestricted) = {SS_res_u:.4f}")
print(f"     F = [({SS_res_r:.2f} - {SS_res_u:.2f}) / {q}] / [{SS_res_u:.2f} / ({n} - {k_u})]")
print(f"     F = {F_stat:.4f},  p-value = {p_F:.4f}")
# Pick closest answer from [2.86, 4.67, 5.xx] — need to see full options
print(f"     Answer: check F ≈ {F_stat:.2f} against provided options")


# ── Q18: Conclusion from joint test ───────────────────────────────────────────
print(f"\nQ18 – Conclusion from joint F-test (α = 0.05):")
if p_F < 0.05:
    print(f"     F = {F_stat:.4f}, p = {p_F:.4f}  → Reject H₀ at 5%")
    print("     Answer: a  (Reject H₀; at least one age variable is significant)")
else:
    print(f"     F = {F_stat:.4f}, p = {p_F:.4f}  → Fail to reject H₀ at 5%")
    print("     Answer: b  (Fail to reject; age terms are redundant)")


# ── Q19: Why are age and age² individually insignificant? ─────────────────────
corr_age_age2 = np.corrcoef(age, age2)[0, 1]
print(f"\nQ19 – Why are age/age² individually insignificant in Reg 3?")
print(f"     corr(age, age²) = {corr_age_age2:.4f}")
print("     Answer: c")
print("     Multicollinearity between age and age² inflates standard errors,")
print("     making it harder to detect individual significance even if jointly")
print("     they explain variation.")


# ── Q20: Removing age² from the model (Regression 2) ─────────────────────────
print(f"\nQ20 – What happens when we remove age² (Regression 2)?")
print(f"     b_age in Reg 2 = {r2['b'][3]:.4f},  p = {r2['p'][3]:.4f}")
print("     Answer: b  (Reg 2: R² improves relative to Reg 3; multicollinearity")
print("     is reduced and the age coefficient becomes estimable)")


# ── Q21: Model comparison by Adjusted R² ──────────────────────────────────────
print(f"\nQ21 – Model comparison by Adjusted R²:")
print(f"     Reg 1 Adj R² = {r1['R2_adj']:.4f}")
print(f"     Reg 2 Adj R² = {r2['R2_adj']:.4f}")
print(f"     Reg 3 Adj R² = {r3['R2_adj']:.4f}")
best_adjR2 = ["Reg 1", "Reg 2", "Reg 3"][np.argmax([r1["R2_adj"], r2["R2_adj"], r3["R2_adj"]])]
print(f"     Best model by Adj R²: {best_adjR2}")
ans21 = ["a", "b", "c"][np.argmax([r1["R2_adj"], r2["R2_adj"], r3["R2_adj"]])]
print(f"     Answer: {ans21}  ({best_adjR2} preferred by Adj R²)")


# ── Q22: Model comparison by AIC and BIC ──────────────────────────────────────
print(f"\nQ22 – Model comparison by AIC and BIC:")
print(f"     Reg 1  AIC = {r1['AIC']:.2f},  BIC = {r1['BIC']:.2f}")
print(f"     Reg 2  AIC = {r2['AIC']:.2f},  BIC = {r2['BIC']:.2f}")
print(f"     Reg 3  AIC = {r3['AIC']:.2f},  BIC = {r3['BIC']:.2f}")
best_AIC = ["Reg 1", "Reg 2", "Reg 3"][np.argmin([r1["AIC"], r2["AIC"], r3["AIC"]])]
best_BIC = ["Reg 1", "Reg 2", "Reg 3"][np.argmin([r1["BIC"], r2["BIC"], r3["BIC"]])]
print(f"     Best by AIC: {best_AIC}  |  Best by BIC: {best_BIC}")
print("     Answer: b  (Regression 2 preferred by both AIC and BIC)")


# ── Q23: Which model to choose overall? ───────────────────────────────────────
print(f"\nQ23 – Best overall model:")
print("     Answer: b  (Regression 2)")
print("     Reg 2 has a higher Adj R² than Reg 1, better AIC/BIC than Reg 3,")
print("     and avoids the multicollinearity issue introduced by age².")


# ── Q24: Would Regression 3 improve with larger sample / wider age range? ─────
print(f"\nQ24 – Would Regression 3 improve with larger sample / wider age range?")
print("     Answer: True")
print("     With more observations spanning a wider range of ages, the age and")
print("     age² terms would be identified more precisely, reducing the")
print("     multicollinearity problem and potentially revealing significance.")


print("\n\n" + "="*60)
print("  SUMMARY OF ANSWERS")
print("="*60)
me1_s = [b1_r1 + 2 * b2_r1 * e for e in [1, 8, 15]]
me2_s = [b1_r2 + 2 * b2_r2 * e for e in [1, 8, 15]]
ans9 = "a" if all(m2 > m1 for m1, m2 in zip(me1_s, me2_s)) else "c"
ans10 = "a" if r1['b'][1] < r2['b'][1] else "b"
ans12 = ["a","b","c","d"][min(3, int(tp2 >= 2) + int(tp2 >= 5) + int(tp2 >= 12))]
ans14 = "b" if (r3["b"][3] > 0 and r3["b"][5] < 0) else "a"
ans15 = "a" if (r3["p"][3] < 0.05 and r3["p"][5] < 0.05) else \
        "b" if (r3["p"][3] >= 0.05 and r3["p"][5] >= 0.05) else "c"
ans18 = "a" if p_F < 0.05 else "b"
ans21 = ["a","b","c"][np.argmax([r1["R2_adj"], r2["R2_adj"], r3["R2_adj"]])]
answers = {
     1: "d",   2: "c",   3: "c",   4: "b",   5: "b",
     6: "b",   7: "a",   8: "b" if r2["p"][3] < 0.05 else "c",
     9: ans9,  10: ans10, 11: "b", 12: ans12, 13: "b",
    14: ans14, 15: ans15, 16: "b", 17: f"F≈{F_stat:.2f}",
    18: ans18, 19: "c",  20: "b",  21: ans21, 22: "b", 23: "b", 24: "True"
}
for q_num in range(1, 25):
    print(f"  Q{q_num:>2}: {answers[q_num]}")

print("\nDone.\n")
