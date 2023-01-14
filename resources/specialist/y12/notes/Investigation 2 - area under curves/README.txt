It seems some people actually noticed this was uploaded. Just in case you bothered to try it out, here is a HOW-TO:

Function: this takes python-style math expressions, so x**x means x^2. Also make sure to specifically multiply everything, so 2x is entered as 2*x. ALSO... decimal numbers in the function should be entered as decimal.Decimal('number') including the '' so to enter the function 0.1x^2 you must write
 
       decimal.Decimal('0.1')*x**2

it is retarded, I know... whatever




Number of rectangles: That is obvious - the number of rectangles used during the "integration"

Lower bound: bottom end of the integration (the lower limit)

Upper bound: top end of the integration (the upper limit)

Maximum number of decimal places to display: Obvious - displays that many decimal places. Note however that this also affects the way some numbers are calculated, so to be safe set it 10 or above.

Cut-off: This is an annoying thing I had to implement to make sure the program worked correctly. It is a number between 0 and 1, and setting it around 0.9 to 0.95 works well. The more decimal places you choose to display, the closer to 1 you should set it.



Example: "integrate" x^2 from 1 to 3 with 1000 rectangles

Function: x**2
Number of rectangles: 1000
Lower bound: 1
Upper bound: 3
Maximum number of decimal places to display: 10
Cut-off: 0.95

[output]
Overall total = 8.66666800