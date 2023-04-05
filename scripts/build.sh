#!/bin/bash

directory="../resources" # /resources/
output="../build" # /build/
maxsize=2147483648 # 2 GB limit
filesize=0

# Zips a folder and sets $filesize to its size
zip_and_set_size() { # $1 is subdir, $2 is subdir_name
  zip -r $output/$2.zip $1
  filesize=$(stat -c%s "$output/$2.zip")
}

# If determined to be too large to zip, create text file with explanation
too_large() { # $1 is subdir, $2 is subdir_name
  echo -e "$1 was too large to be zipped (>2 GB).\nTry downloading it with https://download-directory.github.io/" > $output/_FAILED_$2.txt
}

# Misses files in base subdir/ folder
normal_breakup() { # $1 is subdir, $2 is subdir_name
  zip_and_set_size "$1/y11" "$2_y11"
  filesize_y11=$filesize
  zip_and_set_size "$1/y12" "$2_y12"
  filesize_y12=$filesize

  # Even breaking it up smaller wasn't enough. No point in breaking it up further
  if (( filesize_y11 > maxsize )); then
    rm $output/$2_y11.zip
    too_large "$1/y11" "$2_y11"
  fi
  if (( filesize_y12 > maxsize )); then
    rm $output/$2_y12.zip
    too_large "$1/y12" "$2_y12"
  fi
}

# Normal breakup if y11 and y12 exist, otherwise too_large
try_normal_breakup() { # $1 is subdir, $2 is subdir_name
  # Zip has already been removed
  if [[ ! -d $1/y11 || ! -d $1/y12 ]]; then # Won't be able to reasonably break it up any smaller
    too_large "$1" "$2"
  else
    normal_breakup "$1" "$2"
  fi
}

# Have to break up english-lit differently
english_lit_breakup() { # $1 is subdir, $2 is subdir_name
  # If english-lit is too big to combine, split into /english and /lit
  zip_and_set_size "$1/english" "english"
  filesize_english=$filesize
  zip_and_set_size "$1/lit" "lit"
  filesize_lit=$filesize

  if (( filesize_english > maxsize )); then
    rm $output/english.zip
    try_normal_breakup "$1/english" "english"
  fi
  if (( filesize_lit > maxsize )); then
    rm $output/lit.zip
    try_normal_breakup "$1/lit" "lit"
  fi

  # As for /books and /book notes, first try to combine, then split up
  zip -r $output/$2_books-and-notes.zip $1/books $1/book_notes
  filesize_books_and_notes=$(stat -c%s "$output/$2_books-and-notes.zip")
  if (( filesize_books_and_notes > maxsize )); then
    rm $output/$2_books-and-notes.zip
    #too_large "$1/books and $1/book notes" "$2_books-and-notes"

    zip_and_set_size "$1/books" "$2_books"
    filesize_books=$filesize
    zip_and_set_size "$1/book_notes" "$2_book_notes"
    filesize_book_notes=$filesize

    if (( filesize_books > maxsize )); then
      rm $output/$2_books.zip
      too_large "$1/books" "$2_books"
    fi
    if (( filesize_book_notes > maxsize )); then
      rm $output/$2_book_notes.zip
      too_large "$1/book_notes" "$2_book_notes"
    fi
  fi
}



if [ ! -d "$output" ]; then
  mkdir $output
fi

cd $directory
for subdir in "."/*; do

  if [ ! -d "$subdir" ]; then # Folders only; skip files for example README.md
    continue
  fi
  subdir_name=$(basename "$subdir") # Eg. instead of ../resources/physics, just physics

  zip_and_set_size "$subdir" "$subdir_name"
  if (( filesize > maxsize )); then # Surpassed 2 GB limit
    rm $output/$subdir_name.zip

    if [ "$subdir_name" = "english-lit" ]; then
      english_lit_breakup "$subdir" "$subdir_name"
    else
      try_normal_breakup "$subdir" "$subdir_name"
    fi
  fi

done
cd ../scripts
