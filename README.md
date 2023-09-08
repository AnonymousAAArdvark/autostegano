<p align="center">
  <img src="https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/4cf7b330-fa75-4e97-8a3c-3ab257f795ba" width="275"> <br />
  <b>Automatically compress images using SVD and hide them in cover images using Steganography</b>
</p>


https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/0f9f5cb2-7da4-422b-8a72-98c4d7fb47b2



https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/4ff090bc-f1fd-4ed0-a704-a6550cf22544




## Description

- AutoStegano is an image steganography web program utilizing ReactJS and Web Workers which hides a secret image within a cover image, that involves embedding data in the image's pixel color values, allowing for exceptionally secure data concealment due to using novel algorithms to compress the hidden image, as well as hiding the image in "plain sight" inside another image through utilizing steganography techiniques.
- Linear Algebra is used to compress the hidden image through representing the image as three color matrices, and then reducing the rows and columns of the resultant matrices computed through Singular Value Decomposition.
- Web Workers written in Rust are employed to sideload complex and intensive matrix computations from the React Javascript frontend to the more performant language Rust, which requires a parallel and asynchronous structure to communicate concisely and precisely between the user interface and backend.

## How this works
![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/f7c196a4-4fb6-4113-bcba-fc68282c6c08)

### What is Singular Value Decomposition?
SVD states that every (m x n) matrix A can be written as this product:

![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/bb88b0ea-c5a6-4dab-ae1e-cabf89c474ca)
- U and V are orthogonal matrices
- The matrix Σ consists of descending non-negative values on its diagonal and zeros elsewhere.
- The entries σ1 ≥ σ2 ≥ σ3 ≥ … ≥ 0 on the diagonal of Σ are called the singular values (SVs) of A.

### What is Reduced Singular Value Decomposition?
- If there are zero rows or columns of the matrix Σ, then they can be removed as they have no impact on the output of the SVD result.
- Consequently, the corresponding columns of the U matrix to the zero Σ rows as well as the corresponding rows of the V matrix to the zero Σ columns can be removed as they also have zero impact on the output.

For example, to calculate RSVD for this SVD:

![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/0b38642d-a9f3-460d-8706-305e74cabfe8)

You simply remove the zero row of Σ, with the corresponding column of U:

![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/8c32b1fe-4301-4f38-8e18-7661af5f1b91)

### How can RSVD be applied to an image?
- The data in the matrices U, Σ and V is sorted by how much it contributes to the matrix A in the product. That enables us to get quite a good approximation by simply using only the most important parts of the matrices.
- We now choose a number k of singular values that we are going to use for the approximation. The higher this number, the better the quality of the approximation gets but also the more data is needed to encode it. We now take only the first k columns of U and V and the upper left (k × k)-square of Σ, containing the k largest (and therefore most important) singular values. 

![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/acbe2113-9c32-4ea2-9298-598056a97b4e)

### How much data is needed to store this approximation? 

The amount of data needed to store this approximation is proportional to the colored area:

![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/2beecda2-2713-4488-abf3-37a53ab053cd)

- compressed size = m × k + k + k × n = k × (1 + m + n)

### Drawbacks of SVD Compression

After attempting to implement the RSVD algorithm myself using Javascript when working on the website, I realized several reasons why this compression method is no longer used today:

1. Computing the SVD of an image is extremely computationally expensive. 
2. The encoded values of the SVD output are hard to store. The values inside the U and V matrices range between .999 and -.999, and the singular values range between 10,000 and -10,000. A single RGB pixel ranges between 0 and 255.
3. Compressing an image using SVD is not lossless. There is a noticeable quality decrease as less and less singular values are used. There are algorithms today that can encode a similar amount of data with no quality loss.

## How THIS works

![image](https://github.com/AnonymousAAArdvark/autostegano/assets/42499336/e7aa0860-6ab1-4cb0-b201-01343c997a00)
Can't tell a difference? Look closer! The image on the right has its pixel values slightly altered such that it contains data for a hidden image!

### What is Steganography?

- Where cryptography attempts to obscure the content of a message so that it cannot be decoded or understood, steganography attempts to conceal the existence of a message so that it cannot be found.
- Image steganography is the process of hiding information which can be text, image or video inside a cover image. The secret information is hidden in a way that it is (usually) not visible to the human eyes.

### Steganography Technique - LSB

- The Least Significant Bit (LSB) method is one of the most common techniques used in image steganography.
- In this method, the least significant bit(s) of each pixel in an image is modified to contain a secret message.
- In an 8-bit grayscale image, each pixel has a value between 0 and 255. 


## Authors

Andrew Yang
ex. [@AnonymousAAArdvark](https://github.com/anonymousaaardvark)

## Acknowledgments

Inspiration, code snippets, etc.
* [awesome-readme](https://github.com/matiassingers/awesome-readme)
* [PurpleBooth](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
* [dbader](https://github.com/dbader/readme-template)
* [zenorocha](https://gist.github.com/zenorocha/4526327)
* [fvcproductions](https://gist.github.com/fvcproductions/1bfc2d4aecb01a834b46)
