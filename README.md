
----->browser used: Edge
-----> please click once on the canvas to enable the keyboard keys to work

controls:

>>> "i" move camera closer/inward by 1 unit per press

>>> "o" move camera further/outward by 1 unit per press

>>> "r" start/stop rotation (m cube rotates about y axis by 20RPM & Flower cube around the x axis by 30RPM)

>>> "s" image scrolling by one unit per time on x axis

>>> "t" image rotation by 15RPM

>>>EXTRA>>> "esc" resets the camera. This is extra for easiness of the view
>>>EXTRA>>>"y" to enable light and shade. this is extra just playing around with the code

what i have done:
((1)) used a 1000 x 1000 for canvas size and made extensive comments and a readme file. Enabled the depth buffer and had a black background.
((2)) loaded 2 images for 2 cubes and they are size 512x512
((3)) first cube 2x2x2 and filtering is set to nearest neighbor
((4)) second cube 2x2x2 and image is zoomed out by 50% and Enabled Mip Mapping for the zoomed texture using tri-linear filtering.
((5)) one cube at -4,0,0 and other at 4,0,0 with prespective projection and horizontal fov to 50 and had i and o keys to make camera go inward and outward by 1 unit per press
((6)) r is used to enable and disable the rotation, m cube about y axis with 20
RPM and flower cube about x axis with 30RPM
EXTRA CREDIT: 
((1)) t to enable and disable the img or texture of first cube (m cube) around the center of the face of each cube with 15 RPM, moved
 the img by -o.5 on x and y so it is centered and used the WRAP repeated mode
((2)) s to scroll the imgs on the faces of the cubes by 1 unit per second and used the WRAP repeat
