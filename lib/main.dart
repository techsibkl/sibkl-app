import "package:firebase_core/firebase_core.dart";
import "package:firebase_messaging/firebase_messaging.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
// ignore: depend_on_referenced_packages
import "package:get/get.dart";
import "package:get_storage/get_storage.dart";
import "package:overlay_support/overlay_support.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/screens/auth/pages/auth_wrapper.dart";
import "package:sibkl_cms/services/auth.dart";
import "package:sibkl_cms/services/firestore.dart";
import "package:sibkl_cms/shared/splash_screen.dart";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // await dotenv.load();
  await GetStorage.init();
  await Firebase.initializeApp();
  final FirebaseMessaging messaging = FirebaseMessaging.instance;
  await messaging.setAutoInitEnabled(true);
  // createNotificationChannel();
  final String? fcmToken = await messaging.getToken();
  print("FCM Token: $fcmToken");
  messaging.onTokenRefresh
      .listen((newToken) => print('Refreshed Token: $newToken'));
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Message notification: ${message.notification!.title} ${message.notification!.body}');
  });

  Get.put(DatabaseService());
  Get.put(AuthService());
  runApp(SIBKLCmsApp());
}

Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Handling a background message: ${message.messageId}');
}

class SIBKLCmsApp extends StatelessWidget {
  const SIBKLCmsApp({super.key});

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: [SystemUiOverlay.top, SystemUiOverlay.bottom]);
    SystemChrome.setPreferredOrientations(
        [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);

    return OverlaySupport.global(
      child: GetMaterialApp(
        transitionDuration: Duration(milliseconds: 300),
        defaultTransition: Transition.rightToLeft,
        debugShowCheckedModeBanner: false,
        title: "PreScam.AI",
        themeMode: MyThemeServiceController().themeMode,
        theme: MyThemeServiceController.light,
        darkTheme: MyThemeServiceController.dark,
        builder: (context, child) {
          return MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaler: TextScaler.linear(0.8)),
            child: child!,
          );
        },
        home: FutureBuilder(
          future: delaySeconds(2),
          builder: (context, snapshot) {
            if (snapshot.hasError) {
            } else if (snapshot.connectionState == ConnectionState.done) {
              return AuthWrapper();
            }
            // Show splash screen while loading
            return SplashScreen();
          },
        ),
      ),
    );
  }
}

Future<void> delaySeconds(int sec) async {
  await Future.delayed(Duration(seconds: sec));
}
