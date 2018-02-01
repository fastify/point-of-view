/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test-with-snapshot.js TAP reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true; requires TAP snapshots enabled > output 1`] = `
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
    <p>text</p>
    <br/>
    <div>
      <p>Other EJS pages with includes:</p>
      <ul>
        <li>Normal page, <a href="/include-test">here</a></li>
        <li>One include not exist, <a href="/include-one-include-missing-test">here</a>
          (to raise errors)
        </li>
        <li>One attribute not exist, <a href="/include-one-attribute-missing-test">here</a>
          (to raise errors)
        </li>
      </ul>
    <div>
  </body>
</html>

`

exports[`test-with-snapshot.js TAP reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; home > output 1`] = `
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
    <p>Hello from EJS Templates</p>
    <br/>
  </body>
</html>

`

exports[`test-with-snapshot.js TAP reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; page with includes > output 1`] = `
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
        <header>
      Sample header (ejs)
    </header>

    <p>Hello from EJS Templates</p>
        <footer>
      Sample footer (html) - Back to <a href="/">Home</a>
    </footer>

  </body>
</html>

`

exports[`test-with-snapshot.js TAP reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; page with one include missing > output 1`] = `
undefined
`

exports[`test-with-snapshot.js TAP reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; page with one attribute missing > output 1`] = `
undefined
`
