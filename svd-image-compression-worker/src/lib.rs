mod utils;
use js_sys::{ Float32Array };
use nalgebra::base::*;
use std::cmp::*;
use wasm_bindgen::prelude::*;
use web_sys::console;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

fn mat_to_float_32_array<C: Dim>(
    mat: &Matrix<f32, Dynamic, C, VecStorage<f32, Dynamic, C>>,
) -> Float32Array {
    unsafe {
        return Float32Array::view(&mat.data.as_vec());
    }
}

#[wasm_bindgen]
pub struct SvdResult {
    // u: DMatrix<f32>,
    u_multiplied_with_singular_values: DMatrix<f32>,
    singular_values: DVector<f32>,
    v_t: DMatrix<f32>,
    lhs: DMatrix<f32>,
    rhs: DMatrix<f32>,
    current_rank: usize,
    low_rank_approximation: DMatrix<f32>,
}

#[wasm_bindgen]
impl SvdResult {
    fn new(u: DMatrix<f32>, singular_values: DVector<f32>, v_t: DMatrix<f32>) -> SvdResult {
        let low_rank_approximation = DMatrix::zeros(u.nrows(), v_t.ncols());
        let mut u_multiplied_with_singular_values = u;
        for i in 0..singular_values.len() {
            let val = singular_values[i];
            u_multiplied_with_singular_values
                .column_mut(i)
                .scale_mut(val);
        }
        let round1 = |num: f32| -> f32 { (num * 1.0).round() / 1.0 };
        let round2 = |num: f32| -> f32 { (num * 10000.0).round() / 10000.0 };

        SvdResult {
            lhs: u_multiplied_with_singular_values.clone_owned().map(round1),
            rhs: v_t.clone_owned().map(round2),
            u_multiplied_with_singular_values: u_multiplied_with_singular_values.map(round1),
            singular_values,
            v_t: v_t.map(round2),
            current_rank: 0,
            low_rank_approximation,
        }
    }
    pub fn singular_values(&self) -> Float32Array {
        return mat_to_float_32_array(&self.singular_values);
    }
    fn compute_low_rank_approximation_from_scratch(&mut self) {
        let rank = self.current_rank;
        let timing_label = format!("computation of low rank approximation (rank = {})", rank);
        // console::time_with_label(&timing_label);
        self.lhs = self.u_multiplied_with_singular_values.columns(0, rank).clone_owned();
        self.rhs = self.v_t.rows(0, rank).clone_owned();
        self.lhs.mul_to(&self.rhs, &mut self.low_rank_approximation);
        // console::time_end_with_label(&timing_label);
    }
    fn update_low_rank_approximation(&mut self, new_rank: usize) {
        let old_rank = self.current_rank;
        let timing_label = format!(
            "update of low rank approximation (old rank = {}, new rank = {})",
            old_rank, new_rank
        );
        // console::time_with_label(&timing_label);
        let min_rank = min(old_rank, new_rank);
        let max_rank = max(old_rank, new_rank);
        self.lhs = self.u_multiplied_with_singular_values.columns(0, new_rank).clone_owned();
        self.rhs = self.v_t.rows(0, new_rank).clone_owned();
        let del_lhs = self
            .u_multiplied_with_singular_values
            .columns(min_rank, max_rank - min_rank);
        let del_rhs = self.v_t.rows(min_rank, max_rank - min_rank);
        let delta = del_lhs * del_rhs;
        if new_rank > old_rank {
            self.low_rank_approximation += delta;
        } else {
            self.low_rank_approximation -= delta;
        }
        // console::time_end_with_label(&timing_label);
        self.current_rank = new_rank;
    }
    pub fn compute_low_rank_approximation(&mut self, req_rank: usize) -> Float32Array {
        let rank = min(req_rank, self.u_multiplied_with_singular_values.ncols());
        let old_rank = self.current_rank;
        if old_rank < 100 || rank < 100 || 2 * rank < old_rank {
            self.current_rank = rank;
            self.compute_low_rank_approximation_from_scratch();
        } else {
            self.update_low_rank_approximation(rank);
        }
        return mat_to_float_32_array(&self.low_rank_approximation);
    }
    pub fn get_lhs(&mut self) -> Float32Array {
        mat_to_float_32_array(&self.lhs)
    }
    pub fn get_rhs(&mut self) -> Float32Array {
        mat_to_float_32_array(&self.rhs)
    }
}

#[wasm_bindgen]
pub fn svd(a_data: &[f32], nrows: usize, ncols: usize) -> SvdResult {
    let a = DMatrix::from_column_slice(nrows, ncols, a_data);

    // console::time_with_label("computation of SVD");
    let svd = a.svd(true, true);
    // console::time_end_with_label("computation of SVD");
    return SvdResult::new(svd.u.unwrap(), svd.singular_values, svd.v_t.unwrap());
}
