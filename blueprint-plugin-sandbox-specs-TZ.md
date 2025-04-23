# Техническое задание (ТЗ) - blueprint-plugin-sandbox-specs

**1. Название проекта:** `blueprint-plugin-sandbox-specs`

**2. Цель:**
   Разработать плагин для `blueprint`, который автоматически генерирует шаблонные файлы тестов (`.spec.ts`) для скриптов, использующих `SandboxNetworkProvider`. Это упростит и ускорит процесс написания тестов для скриптов развертывания и взаимодействия с контрактами в sandbox-окружении.

**3. Основные функции:**
   - **Поиск скриптов:** Плагин должен находить все файлы с расширением `.ts` (исключая файлы `.spec.ts` и, возможно, другие по конфигурации) в указанной директории (по умолчанию `Project/scripts` или настраиваемой).
   - **Генерация файлов тестов:** Для каждого найденного скрипта `имя_скрипта.ts` плагин должен генерировать файл `имя_скрипта.spec.ts` в указанной директории для тестов (по умолчанию там же, где скрипты, или настраиваемой).
   - **Шаблонизация:** Генерируемый файл теста должен создаваться на основе предопределенного шаблона. Шаблон должен включать:
     - Необходимые импорты (`@ton/sandbox`, `@ton/test-utils`, `SandboxNetworkProvider`, сам тестируемый скрипт).
     - Стандартную структуру `describe` и `it` блока Jest/Vitest.
     - `beforeEach` блок для инициализации `Blockchain`, `deployer` и `SandboxNetworkProvider`.
     - Пример вызова тестируемого скрипта с передачей `mockProvider`.
     - Закомментированные секции с примерами кода для:
       - Задания начальных условий (например, мокинг `Math.random`).
       - Проверки результатов выполнения скрипта (например, проверка деплоя контракта, вызов его get-методов).
     - Динамическую подстановку имени скрипта в импорты и описания тестов.
   - **Идемпотентность:** По умолчанию плагин не должен перезаписывать уже существующие `.spec.ts` файлы. Должна быть опция (например, флаг `--force` или `--overwrite`) для принудительной перезаписи.
   - **Интеграция с `blueprint`:** Плагин должен быть оформлен как стандартный npm-пакет, который можно установить как зависимость в проекте, созданном с помощью `blueprint`. Предусмотреть возможность вызова генератора через npm-скрипт (`package.json`).

**4. Шаблон генерируемого файла (`имя_скрипта.spec.ts`):**
   ```typescript
   import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
   // TODO: Уточнить путь к нужным типам контрактов или сделать его настраиваемым
   // import { SomeContract } from '../wrappers/SomeContract'; 
   import { run as имя_скриптаScript } from '../scripts/имя_скрипта'; // TODO: Убедиться, что относительный путь корректен
   import '@ton/test-utils';
   import { randomBytes } from 'crypto';
   // TODO: Уточнить или сделать настраиваемым путь к SandboxNetworkProvider
   import { SandboxNetworkProvider } from './helpers/SandboxNetworkProvider'; 

   describe('имя_скрипта script', () => {
       let blockchain: Blockchain;
       let deployer: SandboxContract<TreasuryContract>;
       let mockProvider: SandboxNetworkProvider;
       // Для предсказуемости тестов можно использовать детерминированный ID
       const DETERMINISTIC_ID = BigInt('0x' + randomBytes(4).toString('hex')); 

       beforeEach(async () => {
           blockchain = await Blockchain.create();
           deployer = await blockchain.treasury('deployer');
           mockProvider = new SandboxNetworkProvider(blockchain, deployer);
           // Опционально: настроить вербозность blockchain для тестов
           // blockchain.verbosity = { ...blockchain.verbosity, printSteps: false }; 
       });

       it('should run script successfully', async () => {
           // --- Начальные условия (если нужны) ---
           // const originalMathRandom = Math.random;
           // Math.random = (): number => Number(DETERMINISTIC_ID % 10000n) / 10000; 
           
           // --- Вызов скрипта ---
           await имя_скриптаScript(mockProvider);
           
           // --- Проверки (assertions) ---
           // Убедитесь, что скрипт выполнил ожидаемые действия
           // Например, проверка деплоя контракта:
           /*
           const expectedAddress = //... рассчитайте ожидаемый адрес
           const isDeployed = await mockProvider.isContractDeployed(expectedAddress);
           expect(isDeployed).toBe(true);
           
           const contract = blockchain.openContract(await SomeContract.fromAddress(expectedAddress));
           // Проверки состояния контракта
           expect(await contract.getSomething()).toEqual(/* ожидаемое значение */);
           */

           // --- Восстановление (если нужно) ---
           // Math.random = originalMathRandom;
       });
   }); 
   ```
   *Примечание: Пути к импортам (`../wrappers/`, `../scripts/`, `./helpers/`) должны быть либо корректными по умолчанию для стандартной структуры `blueprint`-проекта, либо настраиваемыми.*

**5. Технологический стек:**
   - Node.js
   - TypeScript
   - Зависимости: `@ton/sandbox`, `@ton/test-utils`, `@ton/core`, `@ton/ton` (если нужны для `SandboxNetworkProvider`), `fs` (для работы с файлами).

**6. Нефункциональные требования:**
   - **Конфигурируемость:** Возможность настроить пути к директориям скриптов и тестов, путь к `SandboxNetworkProvider`, возможно, шаблон файла.
   - **CLI-интерфейс:** Предоставить простой CLI для запуска генерации (например, `npx blueprint-plugin-sandbox-specs generate --scripts-dir=src/scripts --tests-dir=src/tests --overwrite`).
   - **Обработка ошибок:** Корректная обработка ситуаций, когда директории не найдены или нет прав на запись.
   - **Документация:** README файл с описанием установки, использования, конфигурации и примеров.

**7. Дальнейшее развитие (опционально):**
   - Поддержка разных тестовых фреймворков (Jest, Vitest).
   - Более интеллектуальный анализ скрипта для генерации более релевантных тестов (например, определение используемых контрактов).
   - Интерактивный режим CLI для выбора опций. 