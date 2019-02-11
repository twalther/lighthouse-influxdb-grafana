#!/bin/sh

#doing a faux-foreground-daemon
while [ 1 ] ; do
  node app.js
  sleep 120 # every two minutes, eh? why not?
done #There ain't no rest for the wicked, we are never done
