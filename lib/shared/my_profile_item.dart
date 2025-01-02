import "package:flutter/cupertino.dart";
import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";

enum MyProfileItemAction { toggle, more, none }

class MyProfileItem extends StatelessWidget {
  final IconData itemIcon;
  final String text;
  final Color? color;
  final MyProfileItemAction? itemAction;
  final Function? onPressed;

  const MyProfileItem({super.key, 
    required this.text,
    required this.itemIcon,
    this.color,
    this.itemAction = MyProfileItemAction.more,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final MyThemeServiceController themeService = Get.put(MyThemeServiceController());

    return GestureDetector(
      onTap: () => onPressed!(),
      child: Container(
        alignment: Alignment.center,
        padding: EdgeInsets.fromLTRB(20, 25, 20, 25),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: Theme.of(context).cardColor,
        ),
        child: Row(
          children: [
            Icon(
              itemIcon,
              // CupertinoIcons.person,
              color: color ?? Theme.of(context).primaryColor,
              size: 20,
            ),
            SizedBox(width: 10),
            Text(
              text,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: color ?? themeService.textColor,
              ),
            ),
            Expanded(child: Container()),
            if (itemAction == MyProfileItemAction.none)
              Container()
            else
              itemAction == MyProfileItemAction.toggle
                  ? Container(
                      margin: EdgeInsets.all(0),
                      padding: EdgeInsets.all(0),
                      child: Switch(
                          activeColor: Theme.of(context).colorScheme.secondary,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          value: true,
                          onChanged: (value) {}))
                  : Icon(
                      CupertinoIcons.forward,
                      color: color ?? themeService.textColor,
                    ),
          ],
        ),
      ),
    );
  }
}
