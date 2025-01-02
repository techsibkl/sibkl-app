import "package:flutter/material.dart";

const textInputDecoration = InputDecoration(
  contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 16),
  filled: true,
  disabledBorder: OutlineInputBorder(
    borderRadius: BorderRadius.all(Radius.circular(10)),
    borderSide: BorderSide(
      color: Colors.transparent,
      width: 0,
    ),
  ),
  focusedBorder: OutlineInputBorder(
    borderRadius: BorderRadius.all(Radius.circular(10)),
    borderSide: BorderSide(
      color: Color(0xFF5D42BF),
      width: 2,
    ),
  ),
  errorBorder: OutlineInputBorder(
    borderRadius: BorderRadius.all(Radius.circular(10)),
    borderSide: BorderSide(
      color: Colors.red,
      width: 1,
    ),
  ),
  focusedErrorBorder: OutlineInputBorder(
    borderRadius: BorderRadius.all(Radius.circular(10)),
    borderSide: BorderSide(
      color: Colors.red,
      width: 1,
    ),
  ),
);
