#!/bin/bash

directory="resources"

mkdir build

for subdirectory in "$directory"/*; do

  if [[ "$subdirectory" == *"/physics" || "$subdirectory" == *"/README.md" ]]; then
    continue
  fi

  subdirectory_name=$(basename "$subdirectory")

  zip -r "build/$subdirectory_name.zip" "$subdirectory"

done

#TODO: refactor
zip -r "build/physics_y11.zip" "resources/physics/y11"
zip -r "build/physics_y12.zip" "resources/physics/y12"
