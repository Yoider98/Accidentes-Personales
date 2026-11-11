/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-must-not-depend-on-infrastructure-or-external-libs',
      comment: 'El núcleo de Dominio debe ser completamente puro: no puede depender de adaptadores, frameworks ni librerías de infraestructura.',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: [
          '^src/infrastructure',
          '^src/application',
          'express',
          'pg',
          'bcrypt',
          'jsonwebtoken',
          'helmet',
          'cors',
          'dotenv',
          '^node:'
        ]
      }
    },
    {
      name: 'application-must-not-depend-on-infrastructure',
      comment: 'La capa de Aplicación (Casos de uso y Puertos) no puede depender de la infraestructura ni de librerías de transporte/persistencia.',
      severity: 'error',
      from: {
        path: '^src/application'
      },
      to: {
        path: [
          '^src/infrastructure',
          'express',
          'pg',
          'helmet',
          'cors',
          '^node:'
        ]
      }
    },
    {
      name: 'no-circular-dependencies',
      comment: 'Prohibidas las dependencias circulares en cualquier capa del sistema.',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    reporterOptions: {
      text: {
        highlightFocused: true
      }
    }
  }
};

