import "package:firebase_auth/firebase_auth.dart";
import "package:get/get.dart";
import "package:google_sign_in/google_sign_in.dart";
import "package:sibkl_cms/models/model_user.dart";
import "package:sibkl_cms/screens/auth/pages/auth_wrapper.dart";
import "package:sibkl_cms/services/firestore.dart";
import "package:sibkl_cms/shared/shared_classes.dart";

class AuthService extends GetxController {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final DatabaseService _db = Get.find();

  // Variables
  late AppUser appUser;
  late Rx<User?> _user;

  @override
  void onReady() {
    super.onReady();
    _user = Rx<User?>(_auth.currentUser);
    _user.bindStream(_auth.userChanges());
    ever(_user, _initScreen);
  }

  void _initScreen(User? user) async {
    if (user == null) {
      appUser = AppUser();
    } else {
      final UserInfo providerInfo = user.providerData[0];
      if (providerInfo.providerId == "password") {
        appUser = AppUser(
            uid: user.uid,
            email: user.email,
            provider: "password",
            isVerified: user.emailVerified);
      }
      if (providerInfo.providerId == "google.com") {
        appUser = AppUser(
            uid: user.uid,
            email: providerInfo.email,
            provider: "google.com",
            isVerified: true);
      }
      await _db.initUser(appUser);
    }
    Get.offAll(() => AuthWrapper());
  }

  // Functions
  Future<ReturnValue> signInWithEmailPassword(
      {required String email, required String password}) async {
    try {
      final UserCredential result = await _auth.signInWithEmailAndPassword(
          email: email, password: password);
      print("signInWithEmailPassword | result: ${result.toString()}");
      return ReturnValue(true, result.user!.email);
    } on FirebaseAuthException catch (err) {
      print("signInWithEmailPassword | error: ${err.message}");
      return ReturnValue(false, err.message);
    }
  }

  Future<ReturnValue> createEmailAccount(
      {required String email, required String password}) async {
    try {
      final UserCredential result = await _auth.createUserWithEmailAndPassword(
          email: email, password: password);
      print("signUpWithEmailPassword | result: ${result.toString()}");
      return ReturnValue(true, result.user?.uid);
    } on FirebaseAuthException catch (err) {
      print("signUpWithEmailPassword | error: ${err.message}");
      return ReturnValue(false, err.message);
    }
  }

  Future<ReturnValue> signInWithGoogle() async {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      // await googleSignIn.signOut();

      final GoogleSignInAccount? account = await googleSignIn.signIn();
      if (account == null) return (ReturnValue(false, "No account selected"));

      print("signInWithGoogle | account selected!");
      final GoogleSignInAuthentication googleAuth =
          await account.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // NEXT: Fix linking Google credential
      final UserCredential result =
          await _auth.signInWithCredential(credential);
      final User? user = result.user;
      print("signInWithGoogle | user is: ${user.toString()}");

      assert(!user!.isAnonymous);
      return ReturnValue(true, user!.providerData[0].email);
    } on FirebaseAuthException catch (err) {
      print("signInWithGoogle | catch: ${err.message}");
      return ReturnValue(false, err.message);
    }
  }

  void logout() async {
    await _auth.signOut();
  }

  void reload() {
    _auth.currentUser!.reload();
  }

  Future<ReturnValue> sendVerificationEmail() async {
    try {
      if (_auth.currentUser == null) {
        return (ReturnValue(false, "User not logged in"));
      }
      print("sendEmailVerification | RAN!");
      await _auth.currentUser!.sendEmailVerification();
      print("sendEmailVerification | SUCCESS!");
      return (ReturnValue(true, "Sent verification email!"));
    } on FirebaseAuthException catch (err) {
      print("sendEmailVerification | FAILED!");
      return (ReturnValue(false, err.message));
    }
  }

  Future<ReturnValue> sendUpdateVerificationEmail(String newEmail) async {
    try {
      if (_auth.currentUser == null) {
        return (ReturnValue(false, "User not logged in"));
      }
      await _auth.currentUser!.verifyBeforeUpdateEmail(newEmail);
      return (ReturnValue(true, "Sent update verification email!"));
    } on FirebaseAuthException catch (err) {
      return (ReturnValue(false, err.message));
    }
  }

  Future<ReturnValue> sendPasswordResetEmail({required String email}) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      return (ReturnValue(true, "Sent password reset email!"));
    } on FirebaseAuthException catch (err) {
      return (ReturnValue(false, err.message));
    }
  }
}
