import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/models/model_notification.dart";
// import "package:sibkl_cms/controllers/user_details_controller.dart";

class SingleNotificationItem extends StatelessWidget {
  final MyNotification notification;

  const SingleNotificationItem({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    final MyThemeServiceController themeService =
        Get.put(MyThemeServiceController());

    // final UserDetailsController userDetailsController = Get.find();

    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      // onTap: () => Get.to(() => NotificationPage(Notification: Notification)),
      child: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 65,
              width: 65,
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  color:
                      Theme.of(context).colorScheme.secondary.withOpacity(0.1)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image.asset(
                  notification.img,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            SizedBox(width: 20),
            Flexible(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notification.title,
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: themeService.textColor),
                  ),
                  SizedBox(height: 4),
                  Text(
                    notification.description,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w300,
                        overflow: TextOverflow.ellipsis,
                        color: themeService.textColor),
                    maxLines: 2,
                  ),
                  SizedBox(height: 4),
                  // Chip(
                  //   label: Text(
                  //     userDetailsController.completedNotificationIDs.contains(Notification.id)
                  //         ? "Completed"
                  //         : "Start now",
                  //     style: TextStyle(
                  //         fontSize: 10,
                  //         fontWeight: FontWeight.w400,
                  //         overflow: TextOverflow.ellipsis,
                  //         color: userDetailsController.completedNotificationIDs
                  //                 .contains(Notification.id)
                  //             ? Theme.of(context).colorScheme.secondary
                  //             : Colors.red[400]),
                  //   ),
                  //   backgroundColor: Theme.of(context).cardColor,
                  //   labelPadding: EdgeInsets.fromLTRB(2, 0, 2, 0),
                  //   side: BorderSide(
                  //       color: userDetailsController.completedNotificationIDs
                  //               .contains(Notification.id)
                  //           ? Theme.of(context).colorScheme.secondary
                  //           : Colors.red[400]!),
                  // ),
                ],
              ),
            ),
          ]),
    );
  }
}
