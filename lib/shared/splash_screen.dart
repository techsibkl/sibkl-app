import "package:flutter/material.dart";
import "package:sibkl_cms/utils/background_loading.dart";

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).splashColor,
      body: Column(
        children: [
          Expanded(child: Container()),
          Center(
            child: Image(
              image: AssetImage("assets/icons/pre-scam-ai-icon.png"),
              height: 120,
              width: 120,
            ),
          ),
          Expanded(child: Container()),
          SmallCubeLoading(),
          SizedBox(height: 100)
        ],
      ),
    );
  }
}