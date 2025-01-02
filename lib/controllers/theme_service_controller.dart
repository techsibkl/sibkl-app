import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:get_storage/get_storage.dart";

class MyThemeServiceController extends GetxController {
  // define light and dark theme data
  static final ThemeData light = ThemeData(
    fontFamily: "Nunito",
  ).copyWith(
    primaryColor: Color.fromARGB(255, 98, 83, 154),
    scaffoldBackgroundColor: Color(0xFFF1EDFC),
    splashColor: Color.fromARGB(255, 11, 11, 32),
    cardColor: Color.fromARGB(255, 248, 246, 253),
    dialogBackgroundColor: Colors.white,
    colorScheme: ColorScheme.fromSwatch().copyWith(
      secondary: Color(0xFF4CB092),
      surface: Colors.white,
    ),
    dividerColor: Colors.black54,
    hintColor: Colors.black54,
  );

  static final ThemeData dark = ThemeData(
    fontFamily: "Nunito",
  ).copyWith(
    primaryColor: Color(0xFF5D42BF),
    scaffoldBackgroundColor: Color(0xFF1a1a1a),
    splashColor: Color.fromARGB(255, 11, 11, 32),
    cardColor: Color(0xFF272525),
    dialogBackgroundColor: Color(0xFF272525),
    colorScheme: ColorScheme.fromSwatch().copyWith(
      secondary: Color(0xFF4CB092),
      surface: Color(0xFF1a1a1a),
    ),
    dividerColor: Colors.white.withOpacity(0.3),
    hintColor: Colors.white.withOpacity(0.49),
  );

  RxBool homePageSelected = true.obs;

  // persistent theme
  final GetStorage _container = GetStorage();
  late bool _cacheisLightMode;

  ThemeMode get themeMode {
    return _storageisLightMode ? ThemeMode.light : ThemeMode.dark;
  }

  bool get _storageisLightMode {
    _cacheisLightMode = _container.read("isLightMode") ?? false;
    return _container.read("isLightMode") ?? false;
  }

  @override
  void onInit() {
    super.onInit();
    _cacheisLightMode = _storageisLightMode;
  }

  void switchTheme() {
    Get.changeThemeMode(_storageisLightMode ? ThemeMode.dark : ThemeMode.light);
    _container.write("isLightMode", !_storageisLightMode);

    _cacheisLightMode = _storageisLightMode;
    print("Switched theme mode to: ${_storageisLightMode ? "Light" : "Dark"}");
  }

  // getx variables
  Color get textColor =>
      !_cacheisLightMode ? Colors.white.withOpacity(0.95) : Colors.black;
  Color get textColor87 =>
      !_cacheisLightMode ? Colors.white.withOpacity(0.82) : Colors.black87;
  Color get textColor70 => !_cacheisLightMode
      ? Colors.white.withOpacity(0.65)
      : Colors.black.withOpacity(0.7);
  Color get textColor54 =>
      !_cacheisLightMode ? Colors.white.withOpacity(0.49) : Colors.black54;
  Color get textColor45 =>
      !_cacheisLightMode ? Colors.white.withOpacity(0.40) : Colors.black45;
  Color get textColor26 =>
      !_cacheisLightMode ? Colors.white.withOpacity(0.21) : Colors.black26;
  Color get textColor12 =>
      !_cacheisLightMode ? Colors.white.withOpacity(0.05) : Colors.black12;
}
