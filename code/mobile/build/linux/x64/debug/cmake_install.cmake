# Install script for directory: /home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/linux

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "Debug")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "0")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set path to fallback-tool for dependency-resolution.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/sbin/llvm-objdump")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  
  file(REMOVE_RECURSE "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/")
  
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo")
    file(RPATH_CHECK
         FILE "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo"
         RPATH "$ORIGIN/lib")
  endif()
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle" TYPE EXECUTABLE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/intermediates_do_not_run/biblioo")
  if(EXISTS "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo")
    file(RPATH_CHANGE
         FILE "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo"
         OLD_RPATH "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/file_selector_linux:/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/flutter_secure_storage_linux:/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/gtk:/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/sqlite3_flutter_libs:/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/url_launcher_linux:/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/linux/flutter/ephemeral:"
         NEW_RPATH "$ORIGIN/lib")
    if(CMAKE_INSTALL_DO_STRIP)
      execute_process(COMMAND "/usr/sbin/llvm-strip" "$ENV{DESTDIR}/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/biblioo")
    endif()
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/data/icudtl.dat")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/data" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/linux/flutter/ephemeral/icudtl.dat")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/libflutter_linux_gtk.so")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/linux/flutter/ephemeral/libflutter_linux_gtk.so")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/libfile_selector_linux_plugin.so")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/file_selector_linux/libfile_selector_linux_plugin.so")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/libflutter_secure_storage_linux_plugin.so")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/flutter_secure_storage_linux/libflutter_secure_storage_linux_plugin.so")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/libgtk_plugin.so")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/gtk/libgtk_plugin.so")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/libsqlite3_flutter_libs_plugin.so")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/sqlite3_flutter_libs/libsqlite3_flutter_libs_plugin.so")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/liburl_launcher_linux_plugin.so")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE FILE FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/url_launcher_linux/liburl_launcher_linux_plugin.so")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib/")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/lib" TYPE DIRECTORY FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/native_assets/linux/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  
  file(REMOVE_RECURSE "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/data/flutter_assets")
  
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Runtime" OR NOT CMAKE_INSTALL_COMPONENT)
  list(APPEND CMAKE_ABSOLUTE_DESTINATION_FILES
   "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/data/flutter_assets")
  if(CMAKE_WARN_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(WARNING "ABSOLUTE path INSTALL DESTINATION : ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  if(CMAKE_ERROR_ON_ABSOLUTE_INSTALL_DESTINATION)
    message(FATAL_ERROR "ABSOLUTE path INSTALL DESTINATION forbidden (by caller): ${CMAKE_ABSOLUTE_DESTINATION_FILES}")
  endif()
  file(INSTALL DESTINATION "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/bundle/data" TYPE DIRECTORY FILES "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build//flutter_assets")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/flutter/cmake_install.cmake")
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/runner/cmake_install.cmake")
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/file_selector_linux/cmake_install.cmake")
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/flutter_secure_storage_linux/cmake_install.cmake")
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/gtk/cmake_install.cmake")
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/sqlite3_flutter_libs/cmake_install.cmake")
  include("/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/plugins/url_launcher_linux/cmake_install.cmake")

endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
if(CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/install_local_manifest.txt"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
if(CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_COMPONENT MATCHES "^[a-zA-Z0-9_.+-]+$")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
  else()
    string(MD5 CMAKE_INST_COMP_HASH "${CMAKE_INSTALL_COMPONENT}")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INST_COMP_HASH}.txt")
    unset(CMAKE_INST_COMP_HASH)
  endif()
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
