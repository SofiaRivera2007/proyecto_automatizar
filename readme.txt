//AdmiCR
El proyecto está pensado para ser una plataforma web que le brinde al usuario herramientas para reforzar su práctica con respecto a los diferentes ejercicios que forman parte de los exámenes de admisión de las universidades públicas

//Descripción
Crear una plataforma web que le brinde al usuario herramientas para reforzar su práctica con respecto a los diferentes ejercicios que forman parte de los exámenes de admisión de las universidades públicas
Público meta, personas desde los 17 años hasta los 25 años, las cuales estén interesados en practicar y reforzar sus conocimientos con respecto a los exámenes de admisión de las universidades públicas (UCR, TEC, UNA)


//Arquitectura
El sistema utiliza una arquitectura monolítica con las siguientes capas:
- resentación: Interfaz de usuario (HTML, CSS, JS).
- Negocio: Lógica de la aplicación, validaciones y procesamiento de datos.
- Datos: Conexión y consultas a la base de datos.

//Servicios de Azure utilizados
- Azure Virtual Machine: Hospeda la aplicación monolítica y sus componentes.
- Azure Networking: Configuración de la red y apertura de puertos para acceso externo. 
- Azure Portal: Interfaz para administrar y configurar recursos.

//Despliegue en Azure
Pasos resumidos del despliegue:
1. Creación de la máquina virtual en Azure.
2. Instalación de dependencias necesarias en la VM.
3. Copia del código fuente a la máquina virtual.
4. Configuración de puertos en **Networking** para permitir acceso.
5. Ejecución de la aplicación.

//Instalar dependencias
[npm install]
[npm install dotenv]
[npm install express]
[npm install jsonwebtoken]
[npm install bycript]


//Ejecutar
[node app.js]
