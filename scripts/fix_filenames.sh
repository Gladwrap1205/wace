#!/bin/bash

flags="nv"

find . \
-type f \
-exec sh -c "mv -$flags"$' "$1" "$(echo $1 \
| sed \"s/\\ _\\ /,\\ /g\" \
| sed \"s/\\([^\\ ]\\)+\\([^\\ ]\\)/\\1\\ \\2/g\" \
| sed \"s/\\([^\\ ]\\)+\\([^\\ ]\\)/\\1\\ \\2/g\" \
| sed \"s/_/\\ /g\" \
| sed \"s/\\ \\{2,\\}/\\ /g\" \
| sed \"s/\\([^\\.\\/]\\)\\.\\{2,\\}/\\1\\./g\" \
| sed \"s/\\.[A-z0-9]\\+\\(\\.[A-z0-9]\\+\\)$/\\1/\" \
| sed \"s/([0-9]\\+)\\ \\?\\(\\.[A-z0-9]\\+\\)$/\\1/\" \
| sed \"s/\\ \\(\\.[A-z0-9]\\+\\)$/\\1/\" \
| sed \"s/\\ -\\ Copy\\(\\.[A-z0-9]\\+\\)$/\\1/\" \
)"' \
sh {} \;


# change 'a _ b' to 'a, b'
# change 'a+b' to 'a b'
# same again, only once only replaces half
# change '_' to ' '
# change '   ' to ' '
# change '...' to '.', but not if in ../ or similar
# change 'a.doc.pdf' to 'a.pdf'
# change 'a(1).pdf' to 'a.pdf'
# change 'a .pdf' to 'a.pdf'
# change 'a - Copy.pdf' to 'a.pdf'
