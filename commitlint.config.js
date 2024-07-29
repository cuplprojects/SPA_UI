export default {
  //Inherited rules
  extends: ['@commitlint/config-conventional'],
  //Define rule type
  rules: {
    'body-leading-blank': [2, 'always'], //Ensure there is a blank line before the commit message body
    'type-empty': [2, 'never'], //The type type of the submitted message is not allowed to be empty
    'subject-case': [0], //Subject case is not checked
    //type type definition, indicating that the type submitted by git must be within the following type range
    'type-enum': [
      2,
      'always',
      [
        'feat', //new feature feature
        'fix', //fix bug
        'docs', //Documentation comments
        'style', //Code format (changes that do not affect code operation)
'refactor', //Refactor (neither adding new features nor fixing bugs)
        'perf', //performance optimization
        'test', //Add missing tests or existing test changes
        'chore', //Changes to the build process or auxiliary tools
        'revert', //rollback commit
        'build', //Build process, external dependency changes (such as upgrading npm packages, modifying packaging configuration, etc.)',
        'ci', //Modify CI configuration and script
        'types', //Type definition file modification
        'wip', //under development
      ],
    ],
  },
};