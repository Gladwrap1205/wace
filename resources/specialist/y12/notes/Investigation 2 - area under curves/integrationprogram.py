import decimal;

def u(x,function):
	return decimal.Decimal(eval(function));

function = raw_input("Function: ");
i = decimal.Decimal(raw_input("Number of rectangles: "));
j = decimal.Decimal(raw_input("Lower bound: "));
k = decimal.Decimal(raw_input("Upper bound: "));
precision = int(raw_input("Maximum number of decimal places to display: "));
ratio = float(raw_input("Cut-off: "));
decimal.getcontext().prec = precision;
print "\n"
wid = (k-j)/i;
xvaru = j;
xvard = k;

uar = decimal.Decimal('0');
dar = decimal.Decimal('0');

print "Lower parts:"
while (xvaru-k)<(-10**(-precision*ratio)):
	uar = uar+u(xvaru,function)*wid;
	#print str(u(xvaru)*wid);
	#print "xvaru: " + str(xvaru);
	xvaru = xvaru + wid;
print "total: " + str(uar) + "\n";

print "Upper parts:"
while (j-xvard)<(-10**(-precision*ratio)):
	dar = dar+u(xvard,function)*wid;
	#print str(u(xvard)*wid);
	xvard = xvard - wid;
print "total: " + str(dar) + "\n"

print "Summary:\nLower: " + str(uar) + "\nUpper: " + str(dar) + "\nOverall total = " + str((uar + dar)/decimal.Decimal('2'));

raw_input("");
