Place image files you want to survey here.

The images should be structured as following:

```
image-files  (this directory)
├── egg
│   ├── original.png
│   ├── variant_A.png
│   └── variant_B.png
├── ham
│   ├── original.png
│   ├── A.png
│   ├── B.png
│   └── C.png
└── spam
    ├── left.png
    └── right.png
```

Every directory here represents an image set.
In each directory, there should be 2 or more images that will be compared.
These images may be named anything, except for `original`.
For every image set, the users will be asked to compare every possible
combination of pairs in that set. For example, for the image set "ham"
above, the users would be asked to compare A and B, A and C, B 
and C.

Optionally, 1 image named `original` may be included in addition
to the images being compared. If the original image is included,
it will be displayed in between the images being compared
in that set. This is useful if you have some baseline image that you
want the users to compare the variants against. For example, you may
have an uncompressed image as the original, and have images compressed
using different methods as the variant images to make users pick
whichever image is more similar to the original.

The images may have any of the extensions listed below. Images with different
extensions can be mixed together.

* `.png`
* `.jpg` or `.jpeg`
* `.gif`
* `.svg`
* `.webp`
*  `.apng`

Fallbacks are not (yet) supported, so make sure that the image type you are
using will be supported by the users browsers. `.png` and `.jpg` are a safe bet
if you are not sure what to use.

You can modify `image_survey/imagesets.py` if you would like to allow
more extensions, or create an issue on the project Github.