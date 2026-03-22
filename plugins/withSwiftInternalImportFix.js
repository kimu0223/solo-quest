/**
 * Expo config plugin: Expo SDK 55 + Xcode 16 で発生する
 * "ambiguous implicit access level for import" エラーを修正する。
 *
 * 既存の post_install フックの先頭に処理を挿入する。
 * （CocoaPods は post_install を複数持てないため）
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const INJECT = `
  # Fix: Expo SDK 55 + Xcode 16 "ambiguous implicit access level for import"
  installer.generated_projects.each do |project|
    project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL'] = 'NO'
      end
    end
  end
  Dir.glob(File.join(installer.sandbox.root, '**', 'ExpoModulesProvider*.swift')).each do |f|
    content = File.read(f)
    if content.include?('internal import')
      File.write(f, content.gsub(/^internal import /, 'import '))
    end
  end
`;

module.exports = function withSwiftInternalImportFix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      if (!fs.existsSync(podfilePath)) return config;

      let content = fs.readFileSync(podfilePath, 'utf8');
      if (content.includes('SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL')) {
        // 既に挿入済み
        return config;
      }

      // 既存の post_install ブロックの先頭に挿入
      if (content.includes('post_install do |installer|')) {
        content = content.replace(
          'post_install do |installer|',
          'post_install do |installer|' + INJECT
        );
        fs.writeFileSync(podfilePath, content);
      }
      return config;
    },
  ]);
};
