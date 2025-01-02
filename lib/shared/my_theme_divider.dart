import "package:flutter/material.dart";

class ThemedDivider extends StatelessWidget {
  final double height;
  final double thickness;
  final double indent;
  final double endIndent;
  final Color? color;

  const ThemedDivider({
    super.key,
    this.height = 16.0,
    this.thickness = 0.5,
    this.indent = 0,
    this.endIndent = 0,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: height,
      thickness: thickness,
      color: color ?? Theme.of(context).dividerColor,
    );
  }
}

class ThemedVerticalDivider extends StatelessWidget {
  final double thickness;
  final double indent;
  final double endIndent;
  final Color? color;

  const ThemedVerticalDivider({
    super.key,
    this.thickness = 0.5,
    this.indent = 12.0,
    this.endIndent = 12.0,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return VerticalDivider(
      width: 0,
      thickness: thickness,
      indent: indent,
      endIndent: endIndent,
      color: color ?? Theme.of(context).dividerColor,
    );
  }
}
