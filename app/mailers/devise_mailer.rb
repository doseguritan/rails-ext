class DeviseMailer < Devise::Mailer
    default from: 'dashboard.smartvending@smartvending.co.id'
    def welcome record, generated_password
       @password = generated_password
       devise_mail(record, :welcome_message, {})
    end
end  