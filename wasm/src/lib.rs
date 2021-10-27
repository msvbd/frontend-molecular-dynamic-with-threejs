use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    /* pub fn alert(s: &str); */
}

#[wasm_bindgen]
pub fn lj_u(rij: f32, sig1: f32, eps1: f32, sig2: f32, eps2: f32) -> f32 {
    let sig = 0.5*(sig1 + sig2);
    let eps = (eps1*eps2).sqrt();
    let sigdr = sig.powi(2)/rij;
    4.0*eps*(sigdr.powi(6) - sigdr.powi(3))
}

#[wasm_bindgen]
pub fn greet() -> f32 {
    12.0/5.0
}