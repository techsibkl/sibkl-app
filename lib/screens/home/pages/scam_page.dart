// import "package:flutter/material.dart";
// import "package:get/get.dart";
// import "package:sibkl_cms/controllers/user_details_controller.dart";
// import "package:sibkl_cms/screens/chat/pages/chat_main.dart";
// import "package:sibkl_cms/controllers/theme_service_controller.dart";
// import "package:sibkl_cms/models/Notification_model.dart";
// import "package:sibkl_cms/screens/home/widgets/Notification_detail_card.dart";
// import "package:sibkl_cms/shared/my_fab.dart";
// import "package:sibkl_cms/shared/my_page_appbar.dart";

// class NotificationPage extends StatelessWidget {
//   final Notification Notification;
//   const NotificationPage({super.key, required this.Notification});

//   @override
//   Widget build(BuildContext context) {
//     final MyThemeServiceController themeService =
//         Get.put(MyThemeServiceController());

//     final UserDetailsController userDetailsController = Get.find();

//     return SafeArea(
//       child: Scaffold(
//         body: CustomScrollView(
//           shrinkWrap: true,
//           slivers: [
//             SliverFillRemaining(
//               hasScrollBody: false,
//               fillOverscroll: true,
//               child: Stack(
//                 children: [
//                   SingleChildScrollView(
//                     child: Padding(
//                       padding: const EdgeInsets.fromLTRB(25, 32, 25, 32),
//                       child: Column(
//                         crossAxisAlignment: CrossAxisAlignment.center,
//                         children: [
//                           MyPageAppBar(
//                               title: "PreNotification.AI",
//                               appBarType: MyAppBarType.xmark),
//                           SizedBox(height: 10),
//                           Chip(
//                             label: Text(
//                               userDetailsController.completedNotificationIDs
//                                       .contains(Notification.id)
//                                   ? "COMPLETED"
//                                   : "NOT COMPLETED",
//                               style: TextStyle(
//                                   fontSize: 10,
//                                   fontWeight: FontWeight.w400,
//                                   overflow: TextOverflow.ellipsis,
//                                   color: userDetailsController.completedNotificationIDs
//                                           .contains(Notification.id)
//                                       ? Theme.of(context).colorScheme.secondary
//                                       : Colors.red[400]),
//                             ),
//                             backgroundColor:
//                                 Theme.of(context).scaffoldBackgroundColor,
//                             labelPadding: EdgeInsets.fromLTRB(2, 0, 2, 0),
//                             side: BorderSide(
//                                 color: userDetailsController.completedNotificationIDs
//                                         .contains(Notification.id)
//                                     ? Theme.of(context).colorScheme.secondary
//                                     : Colors.red[400]!),
//                           ),
//                           SizedBox(height: 10),
//                           Center(
//                             child: Container(
//                               height: 65,
//                               width: 65,
//                               padding: EdgeInsets.all(8),
//                               child: ClipRRect(
//                                 borderRadius: BorderRadius.circular(15),
//                                 child: Image.asset(
//                                   Notification.img,
//                                   fit: BoxFit.cover,
//                                 ),
//                               ),
//                             ),
//                           ),
//                           SizedBox(height: 5),
//                           Text(
//                             Notification.title,
//                             textAlign: TextAlign.center,
//                             style: TextStyle(
//                                 fontSize: 28,
//                                 fontWeight: FontWeight.bold,
//                                 color: themeService.textColor),
//                           ),
//                           SizedBox(height: 30),
//                           NotificationDetailCard(Notification: Notification),
//                           SizedBox(height: 30),
//                           Card(
//                             color: Theme.of(context).cardColor,
//                             shape: RoundedRectangleBorder(
//                               borderRadius: BorderRadius.circular(15),
//                             ),
//                             child: SizedBox(
//                               width: MediaQuery.of(context).size.width,
//                               child: Padding(
//                                 padding:
//                                     const EdgeInsets.fromLTRB(25, 20, 25, 20),
//                                 child: Column(
//                                   crossAxisAlignment: CrossAxisAlignment.start,
//                                   children: [
//                                     Text(
//                                       "What is this?",
//                                       style: TextStyle(
//                                           fontSize: 20,
//                                           fontWeight: FontWeight.bold,
//                                           // overflow: TextOverflow.ellipsis,
//                                           color: themeService.textColor),
//                                     ),
//                                     SizedBox(height: 8),
//                                     Text(
//                                       Notification.longDescription,
//                                       style: TextStyle(
//                                           fontSize: 14,
//                                           fontWeight: FontWeight.w400,
//                                           fontFamily: "Nunito",
//                                           // overflow: TextOverflow.ellipsis,
//                                           color: themeService.textColor),
//                                     ),
//                                   ],
//                                 ),
//                               ),
//                             ),
//                           ),
//                           SizedBox(height: 20),
//                           Card(
//                             color: Theme.of(context).cardColor,
//                             shape: RoundedRectangleBorder(
//                               borderRadius: BorderRadius.circular(15),
//                             ),
//                             child: SizedBox(
//                               width: MediaQuery.of(context).size.width,
//                               child: Padding(
//                                 padding:
//                                     const EdgeInsets.fromLTRB(25, 20, 25, 20),
//                                 child: Column(
//                                   crossAxisAlignment: CrossAxisAlignment.start,
//                                   children: [
//                                     Text(
//                                       "How to identify?",
//                                       style: TextStyle(
//                                           fontSize: 20,
//                                           fontWeight: FontWeight.bold,
//                                           // overflow: TextOverflow.ellipsis,
//                                           color: themeService.textColor),
//                                     ),
//                                     SizedBox(height: 8),
//                                     ...Notification.identify.map((string) {
//                                       return Padding(
//                                         padding: const EdgeInsets.fromLTRB(
//                                             0, 0, 0, 12),
//                                         child: Row(
//                                           crossAxisAlignment:
//                                               CrossAxisAlignment.start,
//                                           children: [
//                                             Text(
//                                               "\u2022", // Bullet point
//                                               style: TextStyle(
//                                                 fontSize: 14,
//                                                 fontWeight: FontWeight.w400,
//                                                 fontFamily: "Nunito",
//                                                 color: themeService.textColor,
//                                               ),
//                                             ),
//                                             SizedBox(
//                                                 width:
//                                                     5), // Space between bullet and text
//                                             Expanded(
//                                               child: Text(
//                                                 string,
//                                                 style: TextStyle(
//                                                   fontSize: 14,
//                                                   fontWeight: FontWeight.w400,
//                                                   fontFamily: "Nunito",
//                                                   color: themeService.textColor,
//                                                 ),
//                                               ),
//                                             ),
//                                           ],
//                                         ),
//                                       );
//                                     }),
//                                   ],
//                                 ),
//                               ),
//                             ),
//                           ),
//                           SizedBox(height: 60),
//                         ],
//                       ),
//                     ),
//                   ),
//                   // Expanded(child: Container()),
//                   // MyExpandedButton(text: "Start chat"),
//                 ],
//               ),
//             ),
//           ],
//         ),
//         floatingActionButton:
//             MyFAB(onPressedFunc: () => Get.to(() => ChatPage(Notification: Notification))),
//         floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
//       ),
//     );
//   }
// }
