import "package:flutter/material.dart";
import "package:flutter_spinkit/flutter_spinkit.dart";

class SmallCubeLoading extends StatelessWidget {
  const SmallCubeLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return SpinKitFoldingCube(color: Color.fromARGB(255, 185, 164, 164), size: 25);
  }
}
