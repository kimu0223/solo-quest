/**
 * Expo config plugin: Expo SDK 55 + Xcode 16 で発生する
 * "ambiguous implicit access level for import" エラーを修正する。
 *
 * post_install フックで SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL = NO を設定し、
 * さらに生成済み Swift ファイルの `internal import` を `import` に置換する。
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const HOOK = `
# Fix: Expo SDK 55 + Xcode 16 "ambiguous implicit access level for import"
post_install do |installer|
  installer.generated_projects.each do |project|
    project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL'] = 'NO'
      end
    end
  end
  # Also patch internal import in generated Swift files
  Dir.glob(File.join(installer.sandbox.root, '**', 'ExpoModulesProvider*.swift')).each do |f|
    content = File.read(f)
    if content.include?('internal import')
      File.write(f, content.gsub(/^internal import /, 'import '))
    end
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
      if (!content.includes('SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL')) {
        content += HOOK;
        fs.writeFileSync(podfilePath, content);
      }
      return config;
    },
  ]);
};
