import "package:animated_flip_counter/animated_flip_counter.dart";
import "package:flutter/cupertino.dart";
import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/user_details_controller.dart";

class HomeLeaderboardsCard extends StatefulWidget {
  const HomeLeaderboardsCard({super.key});

  @override
  State<HomeLeaderboardsCard> createState() => _HomeLeaderboardsCardState();
}

class _HomeLeaderboardsCardState extends State<HomeLeaderboardsCard> {
  final UserDetailsController userDetailsController =
      Get.put(UserDetailsController());

  // Values for the counters, initially set to 0
  late int points = 100;
  late int ranking = 5;

  @override
  void initState() {
    super.initState();
    // points = userDetailsController.points - 300;
    // ranking = userDetailsController.ranking + 1000;
    // // You might need to set the initial values if required
    // WidgetsBinding.instance.addPostFrameCallback((_) {
    //   setState(() {
    //     points = userDetailsController.points;
    //     ranking = userDetailsController.ranking;
    //   });
    // });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).primaryColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Container(
        padding: EdgeInsets.fromLTRB(45, 25, 45, 25),
        width: MediaQuery.of(context).size.width,
        child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(CupertinoIcons.star, color: Colors.white),
                  SizedBox(height: 2),
                  Text(
                    "POINTS",
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70),
                  ),
                  SizedBox(height: 3),
                  AnimatedFlipCounter(
                    value: points,
                    duration: Duration(seconds: 3),
                    textStyle: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ],
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(CupertinoIcons.globe, color: Colors.white),
                  SizedBox(height: 3),
                  Text(
                    "WORLD RANK",
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70),
                  ),
                  SizedBox(height: 3),
                  AnimatedFlipCounter(
                    value: ranking,
                    prefix: "#",
                    duration: Duration(seconds: 3),
                    textStyle: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ],
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(CupertinoIcons.book, color: Colors.white),
                  SizedBox(height: 1),
                  Text(
                    "LESSON",
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70),
                  ),
                  // SizedBox(height: 3),
                  // Obx(
                  //   () => AnimatedFlipCounter(
                  //     value: userDetailsController.completedScamIDs.length,
                  //     suffix: "/10",
                  //     duration: Duration(seconds: 3),
                  //     textStyle: TextStyle(
                  //         fontSize: 16,
                  //         fontWeight: FontWeight.bold,
                  //         color: Colors.white),
                  //   ),
                  // ),
                ],
              ),
            ]),
      ),
    );
  }
}
