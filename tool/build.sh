#!/bin/bash

rm packages.zip
npm run dev
zip -r packages.zip dist/