'use client';
import styles from './privacy.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Политика конфиденциальности</h1>
          <p className={styles.lastUpdated}>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Общие положения</h2>
            <p className={styles.text}>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
              персональных данных пользователей платформы для поиска работы и стажировок (далее — «Сервис»). 
              Мы серьезно относимся к защите вашей конфиденциальности и обязуемся обрабатывать ваши 
              персональные данные в соответствии с действующим законодательством.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Какие данные мы собираем</h2>
            <div className={styles.dataTypes}>
              <div className={styles.dataType}>
                <h3 className={styles.dataTypeTitle}>Персональная информация</h3>
                <ul className={styles.list}>
                  <li>Имя и фамилия</li>
                  <li>Адрес электронной почты</li>
                  <li>Номер телефона (при указании)</li>
                  <li>Фотография профиля (при загрузке)</li>
                  <li>Дата рождения (при указании)</li>
                </ul>
              </div>
              <div className={styles.dataType}>
                <h3 className={styles.dataTypeTitle}>Профессиональная информация</h3>
                <ul className={styles.list}>
                  <li>Резюме и профессиональный опыт</li>
                  <li>Образование и квалификации</li>
                  <li>Навыки и компетенции</li>
                  <li>Предпочтения по работе</li>
                  <li>История поиска и откликов</li>
                </ul>
              </div>
              <div className={styles.dataType}>
                <h3 className={styles.dataTypeTitle}>Техническая информация</h3>
                <ul className={styles.list}>
                  <li>IP-адрес и данные браузера</li>
                  <li>Информация об устройстве</li>
                  <li>Логи активности на платформе</li>
                  <li>Cookies и аналогичные технологии</li>
                  <li>Геолокационные данные (при согласии)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Цели обработки данных</h2>
            <p className={styles.text}>Мы используем ваши персональные данные для следующих целей:</p>
            <ul className={styles.list}>
              <li>Предоставление услуг платформы (поиск работы, публикация вакансий)</li>
              <li>Создание и управление вашей учетной записью</li>
              <li>Связь с вами по вопросам использования Сервиса</li>
              <li>Улучшение функциональности и пользовательского опыта</li>
              <li>Обеспечение безопасности платформы</li>
              <li>Соблюдение правовых обязательств</li>
              <li>Маркетинговые коммуникации (при вашем согласии)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Правовые основания обработки</h2>
            <div className={styles.legalBases}>
              <div className={styles.legalBase}>
                <h3 className={styles.legalBaseTitle}>Согласие</h3>
                <p className={styles.text}>
                  Обработка данных на основе вашего явного согласия, которое вы можете отозвать в любое время.
                </p>
              </div>
              <div className={styles.legalBase}>
                <h3 className={styles.legalBaseTitle}>Исполнение договора</h3>
                <p className={styles.text}>
                  Обработка данных, необходимая для предоставления вам услуг платформы.
                </p>
              </div>
              <div className={styles.legalBase}>
                <h3 className={styles.legalBaseTitle}>Законные интересы</h3>
                <p className={styles.text}>
                  Обработка данных для улучшения сервиса и обеспечения безопасности платформы.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Передача данных третьим лицам</h2>
            <p className={styles.text}>
              Мы не продаем ваши персональные данные. Мы можем передавать данные третьим лицам только в следующих случаях:
            </p>
            <ul className={styles.list}>
              <li>Работодателям и HR-специалистам (только профильная информация для трудоустройства)</li>
              <li>Поставщикам услуг (хостинг, аналитика, платежные системы)</li>
              <li>По требованию государственных органов</li>
              <li>При слиянии или продаже компании (с уведомлением пользователей)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Безопасность данных</h2>
            <p className={styles.text}>
              Мы применяем современные технические и организационные меры для защиты ваших данных:
            </p>
            <ul className={styles.list}>
              <li>Шифрование данных при передаче и хранении</li>
              <li>Регулярное обновление систем безопасности</li>
              <li>Ограничение доступа к данным только уполномоченным сотрудникам</li>
              <li>Мониторинг и аудит доступа к персональным данным</li>
              <li>Обучение сотрудников вопросам защиты данных</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Сроки хранения данных</h2>
            <div className={styles.retentionPeriods}>
              <div className={styles.retentionPeriod}>
                <h3 className={styles.retentionPeriodTitle}>Активные пользователи</h3>
                <p className={styles.text}>
                  Данные хранятся до удаления учетной записи или отзыва согласия на обработку.
                </p>
              </div>
              <div className={styles.retentionPeriod}>
                <h3 className={styles.retentionPeriodTitle}>Неактивные аккаунты</h3>
                <p className={styles.text}>
                  Данные удаляются через 3 года неактивности после предварительного уведомления.
                </p>
              </div>
              <div className={styles.retentionPeriod}>
                <h3 className={styles.retentionPeriodTitle}>Правовые обязательства</h3>
                <p className={styles.text}>
                  Некоторые данные могут храниться дольше в соответствии с требованиями законодательства.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Ваши права</h2>
            <p className={styles.text}>В соответствии с законодательством о защите данных вы имеете право:</p>
            <ul className={styles.list}>
              <li><strong>Доступ к данным</strong> — получить информацию о том, какие данные мы обрабатываем</li>
              <li><strong>Исправление данных</strong> — потребовать исправления неточных данных</li>
              <li><strong>Удаление данных</strong> — потребовать удаления ваших персональных данных</li>
              <li><strong>Ограничение обработки</strong> — ограничить обработку ваших данных</li>
              <li><strong>Портативность данных</strong> — получить ваши данные в структурированном формате</li>
              <li><strong>Возражение</strong> — возразить против обработки ваших данных</li>
              <li><strong>Отзыв согласия</strong> — отозвать согласие на обработку данных</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Cookies и аналогичные технологии</h2>
            <p className={styles.text}>
              Мы используем cookies и аналогичные технологии для улучшения работы Сервиса:
            </p>
            <div className={styles.cookieTypes}>
              <div className={styles.cookieType}>
                <h3 className={styles.cookieTypeTitle}>Необходимые cookies</h3>
                <p className={styles.text}>
                  Обеспечивают базовую функциональность платформы (авторизация, безопасность).
                </p>
              </div>
              <div className={styles.cookieType}>
                <h3 className={styles.cookieTypeTitle}>Аналитические cookies</h3>
                <p className={styles.text}>
                  Помогают нам понять, как пользователи взаимодействуют с платформой.
                </p>
              </div>
              <div className={styles.cookieType}>
                <h3 className={styles.cookieTypeTitle}>Функциональные cookies</h3>
                <p className={styles.text}>
                  Запоминают ваши предпочтения и настройки для улучшения пользовательского опыта.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Международные передачи данных</h2>
            <p className={styles.text}>
              Ваши данные могут передаваться и обрабатываться в других странах. В таких случаях мы обеспечиваем 
              адекватный уровень защиты данных в соответствии с международными стандартами и требованиями 
              законодательства о защите персональных данных.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Изменения в Политике</h2>
            <p className={styles.text}>
              Мы можем обновлять данную Политику конфиденциальности. О существенных изменениях мы уведомим 
              вас через Сервис или по электронной почте. Рекомендуем периодически проверять данную страницу 
              для ознакомления с актуальной версией Политики.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Контактная информация</h2>
            <p className={styles.text}>
              Если у вас есть вопросы по данной Политике конфиденциальности или вы хотите реализовать 
              свои права, свяжитесь с нами:
            </p>
            <ul className={styles.list}>
              <li>Email: privacy@jobplatform.com</li>
              <li>Телефон: +7 (800) 123-45-67</li>
              <li>Адрес: г. Москва, ул. Примерная, д. 1</li>
              <li>Ответственный за обработку данных: Иванов И.И.</li>
            </ul>
            <p className={styles.text}>
              Вы также можете обратиться в уполномоченный орган по защите персональных данных, 
              если считаете, что ваши права нарушены.
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Используя наш сервис, вы подтверждаете, что ознакомились с данной Политикой конфиденциальности 
            и согласны с обработкой ваших персональных данных в соответствии с указанными условиями.
          </p>
        </div>
      </div>
    </div>
  );
}
