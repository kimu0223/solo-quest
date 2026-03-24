/**
 * Expo config plugin: Expo SDK 55 + Xcode 16 で発生する
 * "ambiguous implicit access level for import" エラーを修正する。
 *
 * 1. AppDelegate.swift の `internal import` を直接置換（prebuild後）
 * 2. Podfileの既存 post_install フック内に SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL = NO を挿入
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const PODFILE_INJECT = `
  # Fix: Expo SDK 55 + Xcode 16 "ambiguous implicit access level for import"
  installer.generated_projects.each do |project|
    project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL'] = 'NO'
      end
    end
  end
  Dir.glob(File.join(installer.sandbox.root, '**', '*.swift')).each do |f|
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
      const platformRoot = config.modRequest.platformProjectRoot;

      // 1. AppDelegate.swift を直接修正
      const appDelegateDir = path.join(platformRoot, config.modRequest.projectName || 'SoloQuest');
      const appDelegatePath = path.join(appDelegateDir, 'AppDelegate.swift');
      if (fs.existsSync(appDelegatePath)) {
        let src = fs.readFileSync(appDelegatePath, 'utf8');
        if (src.includes('internal import')) {
          src = src.replace(/^internal import /gm, 'import ');
          fs.writeFileSync(appDelegatePath, src);
        }
      }

      // 2. Podfile の既存 post_install ブロック内に SWIFT 設定を挿入
      const podfilePath = path.join(platformRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) return config;

      let content = fs.readFileSync(podfilePath, 'utf8');
      if (content.includes('SWIFT_UPCOMING_FEATURE_IMPORT_ACCESS_CONTROL')) {
        // 既に挿入済み
        return config;
      }

      if (content.includes('post_install do |installer|')) {
        content = content.replace(
          'post_install do |installer|',
          'post_install do |installer|' + PODFILE_INJECT
        );
        fs.writeFileSync(podfilePath, content);
      }

      return config;
    },
  ]);
};
