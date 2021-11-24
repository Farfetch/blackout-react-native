require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-riskified-integration"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  Riskified integration for @farfetch/blackout-react-native-analytics
                   DESC
  s.homepage     = package["homepage"]
  s.license    = { :type => "MIT", :file => "LICENSE" }
  s.author       = package["author"]
  s.platforms    = { :ios => "9.0" }
  s.source       = { :path => 'ios/**/*.{h,m,swift}' }
  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.vendored_libraries = "ios/libs/*.a"
end
