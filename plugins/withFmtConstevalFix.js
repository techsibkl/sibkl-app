const { withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const MARKER = "# fmt-consteval-fix";

// Xcode 26+ breaks fmt 11.x (bundled in RN 0.79) due to stricter consteval rules.
// Patches fmt/base.h during `pod install` on EAS and locally.
const SNIPPET = `
    ${MARKER}
    fmt_paths = [
      File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h'),
      (installer.sandbox.respond_to?(:pod_dir) ? File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h') : nil),
    ].compact.uniq

    fmt_paths.each do |fmt_base|
      next unless File.exist?(fmt_base)

      text = File.read(fmt_base)
      patched = text
        .gsub('# define FMT_USE_CONSTEVAL 1', '# define FMT_USE_CONSTEVAL 0')
        .gsub(
          /^(#elif defined\\(__cpp_consteval\\)\\n# define FMT_USE_CONSTEVAL) 1/m,
          "\\\\1 0 // fmt-consteval-fix"
        )

      if patched != text
        File.chmod(0o644, fmt_base)
        File.write(fmt_base, patched)
        Pod::UI.puts "[withFmtConstevalFix] Patched \#{fmt_base}"
        break
      end
    end

    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'

      target.build_configurations.each do |build_config|
        build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
      Pod::UI.puts '[withFmtConstevalFix] Set fmt target to C++17'
    end
`;

/**
 * Expo config plugin: Xcode 26+ fmt consteval workaround for RN 0.79.
 * Remove once React Native bundles fmt >= 12.1.0.
 *
 * IMPORTANT: plugins/ must be committed to git — EAS Build only uploads tracked files.
 */
module.exports = function withFmtConstevalFix(config) {
	return withDangerousMod(config, [
		"ios",
		(cfg) => {
			const podfilePath = path.join(
				cfg.modRequest.platformProjectRoot,
				"Podfile",
			);

			if (!fs.existsSync(podfilePath)) {
				return cfg;
			}

			let contents = fs.readFileSync(podfilePath, "utf8");

			if (contents.includes(MARKER)) {
				return cfg;
			}

			// Inject after react_native_post_install so pods are fully resolved.
			const anchor =
				/(react_native_post_install\([\s\S]*?\)\n)(\s*(?:#\s*This is necessary for Xcode 14|$))/;

			if (anchor.test(contents)) {
				contents = contents.replace(anchor, `$1${SNIPPET}$2`);
			} else {
				const fallback = /(post_install do \|installer\|\n)/;
				if (!fallback.test(contents)) {
					throw new Error(
						"withFmtConstevalFix: could not find injection point in Podfile",
					);
				}
				contents = contents.replace(fallback, `$1${SNIPPET}`);
			}

			fs.writeFileSync(podfilePath, contents);
			return cfg;
		},
	]);
};
