#!/bin/bash

directory="../../resources"
maxsize=2097152 # 2 GB limit

mkdir build

for subdir in "$directory"/*; do

  if [ ! -d "$subdir" ]; then # Skip files for example README.md
    continue
  fi

  subdir_name=$(basename "$subdir")

  zip -r "build/$subdir_name.zip" "$subdir"
  filesize=$(stat -c%s "build/$subdir_name.zip")

  if (( filesize > maxsize )); then # Surpassed 2 GB limit

    rm build/$subdir_name.zip

    if [ ! -d "$subdir/y11" || ! -d "$subdir/y12" ]; then # Won't be able to reasonably break it up any smaller
      echo "$subdir was too large to be zipped. Try downloading it with https://download-directory.github.io/" > build/_FAILED_$subdir_name.txt
      continue
    fi

    zip -r "build/${subdir_name}_y11.zip" "$subdir/y11"
    zip -r "build/${subdir_name}_y12.zip" "$subdir/y12"
    filesize_y11=$(stat -c%s "build/${subdir_name}_y11.zip")
    filesize_y12=$(stat -c%s "build/${subdir_name}_y12.zip")

    if (( filesize_y11 > maxsize || filesize_y12 > maxsize )); then # Even breaking it up smaller wasn't enough
      rm build/${subdir_name}_y11.zip
      rm build/${subdir_name}_y12.zip
      echo "$subdir was too large to be zipped. Try downloading it with https://download-directory.github.io/" > build/_FAILED_$subdir_name.txt
    fi

  fi

done
