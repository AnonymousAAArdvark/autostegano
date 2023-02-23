mod utils;
use wasm_bindgen::prelude::*;
use web_sys::console;
use js_sys::{Float32Array, Uint16Array, Uint8ClampedArray};
use nalgebra::base::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const MASK_ONE_VALUES: &[u8] = &[1,2,4,8,16,32,64,128];
const MASK_ZERO_VALUES: &[u8] = &[254,253,251,247,239,223,191,127];

pub fn vec_to_uint_8_clamped_array(vec: &Vec<u8>) -> Uint8ClampedArray {
    unsafe {
        return Uint8ClampedArray::view(&vec);
    }
}

pub fn vec_to_float_32_array(vec: &Vec<f32>) -> Float32Array {
    unsafe {
        return Float32Array::view(&vec);
    }
}

#[wasm_bindgen]
pub struct PropReturn(pub usize, pub usize, pub usize);

#[wasm_bindgen]
pub struct LSBStego  {
    /// Image loaded into Stego
    image: Vec<u8>,
    /// Hieght of loaded image
    height: u32,
    /// Width of loaded image
    width: u32,

    /// Number of channels in loaded image
    channels: usize,

    /// Current channel position
    current_channel: usize,

    /// Current index position
    current_index: usize,

    /// Current index in the MASK_ONE_VALUES
    mask_one: usize,
    /// Current index in the MASK_ZERO_VALUES
    mask_zero: usize,

    /// Maximum amount of bits to mask
    max_lsb: usize,
}

#[wasm_bindgen]
impl LSBStego {
    /// Create a new LSBStego instance by taking in a DynamicImage
    pub fn new(im: &Uint8ClampedArray, width: u32, height: u32) -> Self {
        LSBStego {
            image: im.to_vec(),
            width,
            height,
            channels: 3,
            current_channel: 0,
            current_index: 0,
            mask_one: 0,
            mask_zero: 0,
            max_lsb: 8,
        }
    }

    // /// Returns the size of the loaded image
    // fn get_size(&self) -> u32 {
    //     self.height * self.width
    // }

    /// Returns the mask value of the current maskONE index
    pub fn get_mask_one(&self) -> usize {
        MASK_ONE_VALUES[self.mask_one as usize] as usize
    }

    /// Returns the mask value of the current maskZERO index
    pub fn get_mask_zero(&self) -> usize {
        MASK_ZERO_VALUES[self.mask_zero as usize] as usize
    }

    /// Put a string of binary_values into `self.image`
    pub fn put_binary_value(&mut self, bits: String) {
        for c in bits.chars() {
            // Get pixel value
            if c == '1' {
                // Or with maskONE
                self.image[self.current_index] = self.image[self.current_index] | MASK_ONE_VALUES[self.mask_one as usize];
            }
            else {
                // And with maskZERO
                self.image[self.current_index] = self.image[self.current_index] & MASK_ZERO_VALUES[self.mask_zero as usize];
            }

            self.next_slot();
        }


    }

    /// move to the next slot where information can me mutated
    pub fn next_slot(&mut self) {
        if self.current_channel == self.channels - 1 {
            self.current_channel = 0;
            if self.current_index == self.image.len() - 2 {
                self.current_index = 0;
                if self.mask_one == self.max_lsb - 1 {
                    panic!("No available slots remaining (image filled)");
                }
                else {
                    self.mask_one += 1;
                    self.mask_zero += 1;
                }
            }
            else {
                self.current_index += 2;
            }
        }
        else {
            self.current_channel += 1;
            self.current_index += 1;
        }
    }

    /// Read a single bit from the image
    fn read_bit(&mut self) -> char {
        let val = self.image[self.current_index] & MASK_ONE_VALUES[self.mask_one];
        self.next_slot();

        if val > 0 { '1' } else { '0' }
    }

    /// Read a byte of the image
    fn read_byte(&mut self) -> String {
        self.read_bits(8)
    }

    /// Read n bits from an image
    fn read_bits(&mut self, n: u32) -> String {
        let mut bits = String::with_capacity(n as usize);

        for _ in 0..n {
            bits.push(self.read_bit())
        }

        bits
    }

    /// Returns a binary string in byte size of a given integer
    fn byte_value(&self, val: usize) -> String {
        self.binary_value(val, 8)
    }

    /// Returns the binary of a given integer in the length of `bitsize`
    fn binary_value(&self, val: usize, bitsize: usize) -> String {
        let mut binval = String::with_capacity(bitsize);
        binval.push_str(&format!("{:b}", val));

        if binval.len() > bitsize {
            panic!("binary value larger than the expected size");
        }

        while binval.len() < bitsize {
            binval.insert(0, '0');
        }
        binval

    }

    /// Encodes the hidden image properties into the file
    pub fn init_encode(&mut self, width: usize, height: usize, rank: usize, max_lsb: usize) {
        self.max_lsb = max_lsb;
        self.put_binary_value(self.binary_value(width, 16));
        self.put_binary_value(self.binary_value(height, 16));
        self.put_binary_value(self.binary_value(rank, 16));
    }

    /// Encodes the approximation of a single color channel
    pub fn encode_channel(&mut self, lhs: &Uint8ClampedArray, rhs: &Uint8ClampedArray) {
        let lhs: Vec<u8> = lhs.to_vec();
        let rhs: Vec<u8> = rhs.to_vec();

        for byte in lhs {
            self.put_binary_value(self.byte_value(byte as usize));
        }
        for byte in rhs {
            self.put_binary_value(self.byte_value(byte as usize));
        }
    }

    /// Returns the image in a Uint8ClampedArray
    pub fn get_image(&mut self) -> Uint8ClampedArray {
        vec_to_uint_8_clamped_array(&self.image)
    }

    /// Decodes the hidden image dimensions from the image
    pub fn decode_properties(&mut self) -> PropReturn {
        let width = usize::from_str_radix(&self.read_bits(16), 2).unwrap();
        let height = usize::from_str_radix(&self.read_bits(16), 2).unwrap();
        let rank = usize::from_str_radix(&self.read_bits(16), 2).unwrap();
        PropReturn(width, height, rank)
    }

    /// Decodes the hidden image approximation
    pub fn decode_approximation(&mut self, width: usize, height: usize, rank: usize) -> Uint8ClampedArray {
        let length = (width * rank + height * rank) * 2 * 3;

        let mut raw_rgb: Vec<Vec<u8>> = vec![Vec::with_capacity(length / 3); 3];

        for i in 0..length {
            if i < length / 3 {
                raw_rgb[0].push(u8::from_str_radix(&self.read_byte(), 2).unwrap());
            } else if i < 2 * length / 3 {
                raw_rgb[1].push(u8::from_str_radix(&self.read_byte(), 2).unwrap());
            } else {
                raw_rgb[2].push(u8::from_str_radix(&self.read_byte(), 2).unwrap());
            }
        }

        let mut rgb: Vec<DMatrix<f32>> = vec![DMatrix::zeros(height, width); 3];

        for (i, channel ) in raw_rgb.iter().enumerate() {
            let mut lhs: DMatrix<f32> =
                DMatrix::from_vec(height, rank, (&channel[..(height * rank * 2)])
                .chunks_exact(2)
                .into_iter()
                .map(|a| f32::from(i16::from_ne_bytes([a[0], a[1]])))
                .collect()
            );

            let mut rhs: DMatrix<f32> = DMatrix::from_vec(rank, width, (&channel[(height * rank * 2)..])
                .chunks_exact(2)
                .into_iter()
                .map(|a| f32::from(i16::from_ne_bytes([a[0], a[1]])) / 10000.0)
                .collect()
            );

            lhs.mul_to(&rhs, &mut rgb[i]);
        }

        let mut output: Vec<u8> = Vec::with_capacity(width * height * 4);

        for i in 0..rgb[0].nrows() {
            for j in 0..rgb[0].ncols() {
                output.push(rgb[0][(i, j)].round() as u8);
                output.push(rgb[1][(i, j)].round() as u8);
                output.push(rgb[2][(i, j)].round() as u8);
                output.push(255);
            }
        }

        vec_to_uint_8_clamped_array(&output)
    }
}