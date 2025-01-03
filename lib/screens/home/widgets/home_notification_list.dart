import "dart:convert";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/models/model_notification.dart";
import "package:sibkl_cms/screens/home/widgets/single_notification_item.dart";
import "package:sibkl_cms/shared/my_theme_divider.dart";

class HomeNotificationList extends StatefulWidget {
  const HomeNotificationList({super.key});

  @override
  State<HomeNotificationList> createState() => _HomeNotificationListState();
}

class _HomeNotificationListState extends State<HomeNotificationList> {
  late Future<NotificationsList> notificationsList;

  @override
  void initState() {
    super.initState();
    notificationsList = loadNotifications();
  }

  Future<NotificationsList> loadNotifications() async {
    final String response =
        await rootBundle.loadString("assets/notifications.json");
    final data = await json.decode(response);
    return NotificationsList.fromJson(data);
  }

  @override
  Widget build(BuildContext context) {
    // final VisitorDBService _db = Get.put(VisitorDBService());
    // final AuthService authService = Get.find();
    final MyThemeServiceController themeService =
        Get.put(MyThemeServiceController());

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.max,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: Text(
            "Notifications",
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: themeService.textColor87),
          ),
        ),
        SizedBox(height: 10),
        Expanded(
          child: Card(
            color: Theme.of(context).cardColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: SizedBox(
              // padding: EdgeInsets.fromLTRB(25, 30, 25, 30),
              width: MediaQuery.of(context).size.width,
              child: FutureBuilder(
                future: notificationsList,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Center(
                        child: CircularProgressIndicator(
                            color: Theme.of(context).primaryColor));
                  } else if (!snapshot.hasData ||
                      snapshot.data!.notifications.isEmpty) {
                    return Center(child: Text("No notification available"));
                  } else {
                    return ListView.separated(
                      padding: EdgeInsets.fromLTRB(20, 30, 20, 30),
                      itemCount: snapshot.data!.notifications.length,
                      itemBuilder: (context, index) {
                        final notification =
                            snapshot.data!.notifications[index];
                        return SingleNotificationItem(
                            notification: notification);
                      },
                      separatorBuilder: (context, index) {
                        return ThemedDivider(height: 50);
                      },
                    );
                  }
                },
              ),
            ),
          ),
        ),
        SizedBox(height: 10),
      ],
    );
  }
}
