# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file LICENSE.rst or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION ${CMAKE_VERSION}) # this file comes with cmake

# If CMAKE_DISABLE_SOURCE_CHANGES is set to true and the source directory is an
# existing directory in our source tree, calling file(MAKE_DIRECTORY) on it
# would cause a fatal error, even though it would be a no-op.
if(NOT EXISTS "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-src")
  file(MAKE_DIRECTORY "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-src")
endif()
file(MAKE_DIRECTORY
  "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-build"
  "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix"
  "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix/tmp"
  "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix/src/sqlite3-populate-stamp"
  "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix/src"
  "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix/src/sqlite3-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix/src/sqlite3-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/home/alvim/Desenvolvimento/Github/plf-es-2026-1-ti5-0492100-biblioo/code/mobile/build/linux/x64/debug/_deps/sqlite3-subbuild/sqlite3-populate-prefix/src/sqlite3-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
