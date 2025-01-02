// import "package:flutter/material.dart";
// import "package:font_awesome_flutter/font_awesome_flutter.dart";
// import "package:get/get.dart";
// import "package:sibkl_cms/controllers/theme_service_controller.dart";
// import "package:sibkl_cms/models/model_visitor.dart";
// import "package:sibkl_cms/services/firebase/visitor_db.dart";
// import "package:sibkl_cms/shared/my_confirm_dialog.dart";
// import "package:sibkl_cms/shared/my_theme_divider.dart";
// import "package:sibkl_cms/shared/shared_classes.dart";

// class VisitorInfoDialog extends StatelessWidget {
//   final Visitor visitor;
//   final bool showArrivalStatus;
//   const VisitorInfoDialog({Key? key, required this.visitor, this.showArrivalStatus = false}) : super(key: key);

//   @override
//   Widget build(BuildContext context) {
//     final MyThemeServiceController themeService = Get.put(MyThemeServiceController());
//     final VisitorDBService db = Get.find();

//     return Dialog(
//       insetPadding: EdgeInsets.symmetric(horizontal: 60),
//       elevation: 2,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
//       child: Stack(clipBehavior: Clip.none, alignment: Alignment.topCenter, children: [
//         Column(mainAxisSize: MainAxisSize.min, children: [
//           Padding(
//             padding: EdgeInsets.fromLTRB(32, 32, 32, 22),
//             child: Column(mainAxisSize: MainAxisSize.min, children: [
//               SizedBox(height: 10),
//               Text(
//                 "Visitor info",
//                 style: TextStyle(
//                   fontSize: 24,
//                   fontWeight: FontWeight.bold,
//                   fontFamily: "Nunito",
//                   color: themeService.textColor,
//                 ),
//               ),
//               SizedBox(height: 25),
//               ClipRRect(
//                 borderRadius: BorderRadius.circular(100),
//                 child: Image(
//                   height: 80,
//                   width: 80,
//                   image: AssetImage("assets/images/face.png"),
//                 ),
//               ),
//               SizedBox(height: 15),
//               Text(
//                 visitor.name,
//                 style: TextStyle(
//                   fontSize: 20,
//                   fontWeight: FontWeight.bold,
//                   fontFamily: "Nunito",
//                   color: themeService.textColor70,
//                 ),
//               ),
//               ThemedDivider(height: 40),
//               Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//                 Row(children: [
//                   Icon(Icons.phone, size: 14, color: Theme.of(context).primaryColor),
//                   SizedBox(width: 7),
//                   Text(
//                     visitor.phone,
//                     style: TextStyle(
//                       fontSize: 14,
//                       fontWeight: FontWeight.w300,
//                       color: themeService.textColor70,
//                       letterSpacing: 0.5,
//                     ),
//                   ),
//                 ]),
//                 SizedBox(height: 5),
//                 Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
//                   Icon(FontAwesomeIcons.calendar, size: 14, color: Theme.of(context).primaryColor),
//                   SizedBox(width: 7),
//                   Text(visitor.dialogDateDisplay,
//                       style: TextStyle(
//                           fontSize: 14,
//                           fontWeight: FontWeight.w300,
//                           color: themeService.textColor70,
//                           letterSpacing: 0.5)),
//                 ]),
//               ]),
//             ]),
//           ),
//           IntrinsicHeight(
//             child: Row(children: [
//               Expanded(
//                 child: Container(
//                   height: 60,
//                   color: Colors.transparent,
//                   child: TextButton(
//                     onPressed: () => Get.dialog(MyConfirmDialog(
//                       title: "Warning",
//                       body: "Are you sure to delete the entry for your visitor ${visitor.name}?",
//                       actionText: "Delete entry",
//                       actionColor: Colors.red,
//                       actionFunction: () async {
//                         final ReturnValue result = await db.deleteVisitor(visitor);
//                         Get.back();
//                         if (result.success) Get.back();
//                         Get.showSnackbar(GetSnackBar(message: result.value, duration: Duration(seconds: 2)));
//                       },
//                     )),
//                     child: Padding(
//                       padding: EdgeInsets.fromLTRB(10, 0, 0, 0),
//                       child: Text(
//                         "Delete",
//                         style: TextStyle(
//                           color: Colors.red,
//                           fontSize: 14,
//                           fontWeight: FontWeight.w500,
//                         ),
//                       ),
//                     ),
//                   ),
//                 ),
//               ),
//               ThemedVerticalDivider(thickness: 0.5, indent: 12, endIndent: 12),
//               Expanded(
//                 child: Container(
//                   height: 60,
//                   color: Colors.transparent,
//                   child: TextButton(
//                     onPressed: () => Navigator.pop(context),
//                     child: Padding(
//                       padding: EdgeInsets.fromLTRB(0, 0, 10, 0),
//                       child: Text(
//                         "Close",
//                         style: TextStyle(
//                           color: themeService.textColor54,
//                           fontSize: 14,
//                           fontWeight: FontWeight.w500,
//                         ),
//                       ),
//                     ),
//                   ),
//                 ),
//               ),
//             ]),
//           ),
//         ]),
//         // Top dialog icon
//         Positioned(
//             top: -20,
//             child: showArrivalStatus
//                 ? CircleAvatar(
//                     backgroundColor: Colors.white,
//                     child: Container(
//                       padding: EdgeInsets.all(5),
//                       decoration: BoxDecoration(borderRadius: BorderRadius.circular(15), color: visitor.listIconColor),
//                       // circular profile picture inside
//                       child: Image(image: AssetImage("assets/images/${visitor.listIconImage}")),
//                     ))
//                 : Container()),
//       ]),
//     );
//   }
// }
