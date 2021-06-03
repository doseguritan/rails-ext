Rails.application.routes.draw do
  devise_for :users, controllers: { sessions: 'users/sessions' }
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root "entrance#index"
  resources :menus do
    collection do
      get :navigation, as: :nav, action: :navigation
      get :option, as: :option, action: :options
      delete '', as: '', action: :destroy
    end
  end
  namespace :users do
    resources :users do
      collection do
        # get :navigation, as: :nav, action: :navigation
        get :option, as: :option, action: :options
        delete '', as: '', action: :destroy
      end
    end
  end
end
