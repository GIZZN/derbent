'use client';
import Link from 'next/link';
import styles from './terms.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Условия использования</h1>
          <p className={styles.lastUpdated}>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Общие положения</h2>
            <p className={styles.text}>
              Настоящие Условия использования (далее — «Условия») регулируют отношения между пользователями 
              и платформой для поиска работы и стажировок (далее — «Сервис»). Использование Сервиса означает 
              ваше согласие с данными Условиями.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Описание сервиса</h2>
            <p className={styles.text}>
              Наш сервис предоставляет платформу для:
            </p>
            <ul className={styles.list}>
              <li>Поиска вакансий и стажировок</li>
              <li>Создания и размещения резюме</li>
              <li>Взаимодействия между работодателями и соискателями</li>
              <li>Публикации вакансий HR-специалистами</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Регистрация и учетные записи</h2>
            <p className={styles.text}>
              Для использования Сервиса необходимо создать учетную запись. Вы обязуетесь:
            </p>
            <ul className={styles.list}>
              <li>Предоставлять достоверную и актуальную информацию</li>
              <li>Поддерживать безопасность своей учетной записи</li>
              <li>Немедленно уведомлять нас о любом несанкционированном использовании</li>
              <li>Нести ответственность за все действия под вашей учетной записью</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Типы пользователей</h2>
            <div className={styles.userTypes}>
              <div className={styles.userType}>
                <h3 className={styles.userTypeTitle}>Кандидаты</h3>
                <p className={styles.text}>
                  Могут создавать резюме, искать вакансии и стажировки, подавать заявки на интересующие позиции.
                </p>
              </div>
              <div className={styles.userType}>
                <h3 className={styles.userTypeTitle}>HR-специалисты</h3>
                <p className={styles.text}>
                  Могут публиковать вакансии, просматривать резюме кандидатов, управлять процессом найма.
                </p>
              </div>
              <div className={styles.userType}>
                <h3 className={styles.userTypeTitle}>Университеты</h3>
                <p className={styles.text}>
                  Могут публиковать стажировки и программы для студентов, взаимодействовать с кандидатами.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Правила использования</h2>
            <p className={styles.text}>При использовании Сервиса запрещается:</p>
            <ul className={styles.list}>
              <li>Размещать ложную, вводящую в заблуждение или недостоверную информацию</li>
              <li>Нарушать права интеллектуальной собственности</li>
              <li>Использовать Сервис для незаконных целей</li>
              <li>Создавать фальшивые учетные записи</li>
              <li>Спамить или рассылать нежелательные сообщения</li>
              <li>Нарушать конфиденциальность других пользователей</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Конфиденциальность</h2>
            <p className={styles.text}>
              Мы серьезно относимся к защите ваших персональных данных. Подробная информация о том, 
              как мы собираем, используем и защищаем вашу информацию, содержится в нашей{' '}
              <Link href="/privacy" className={styles.link}>Политике конфиденциальности</Link>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Интеллектуальная собственность</h2>
            <p className={styles.text}>
              Все материалы Сервиса, включая дизайн, текст, графику, логотипы, являются объектами 
              интеллектуальной собственности и защищены авторским правом. Вы не можете использовать 
              эти материалы без нашего письменного разрешения.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Ответственность</h2>
            <p className={styles.text}>
              Сервис предоставляется «как есть». Мы не гарантируем бесперебойную работу Сервиса 
              и не несем ответственности за любые убытки, возникшие в результате использования 
              или невозможности использования Сервиса.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Изменения условий</h2>
            <p className={styles.text}>
              Мы оставляем за собой право изменять данные Условия в любое время. О существенных 
              изменениях мы уведомим пользователей через Сервис или по электронной почте. 
              Продолжение использования Сервиса после внесения изменений означает ваше согласие 
              с новыми Условиями.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Прекращение использования</h2>
            <p className={styles.text}>
              Мы можем приостановить или прекратить ваш доступ к Сервису в любое время без 
              предварительного уведомления, если вы нарушаете данные Условия или действующее 
              законодательство.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Контактная информация</h2>
            <p className={styles.text}>
              Если у вас есть вопросы по данным Условиям, вы можете связаться с нами:
            </p>
            <ul className={styles.list}>
              <li>Email: support@jobplatform.com</li>
              <li>Телефон: +7 (800) 123-45-67</li>
              <li>Адрес: г. Москва, ул. Примерная, д. 1</li>
            </ul>
          </section>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Используя наш сервис, вы подтверждаете, что прочитали, поняли и согласны с данными Условиями использования.
          </p>
        </div>
      </div>
    </div>
  );
}
